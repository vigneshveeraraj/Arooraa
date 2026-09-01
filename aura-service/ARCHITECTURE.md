# Aura service architecture (A0/A1 foundation)

## Why a separate service, not a module inside lead-service

`arooraa-lead-service` stays responsible for project enquiries, Careers, Contact and their
notifications — nothing about Aura's conversation, retrieval or provider surface touches that
service. Aura is deliberately a fully independent Spring Boot application (own `pom.xml`, own
`Dockerfile`, own database) living in this sibling directory, not a package added to
`backend/`. Reasons:

- `lead-service`'s own boundary is already "independent from other AROORAA backend services"
  (see its `pom.xml` description) — adding Aura there would violate that on day one.
- Aura's persistence needs (pgvector, versioned knowledge documents, embeddings) are unrelated
  to lead-service's relational lead/notification data — a shared schema would couple two
  systems that should evolve independently.
- A production incident, deploy, or scaling decision for one must never require touching the
  other.

## What exists in A0/A1

- **Service skeleton**: `AuraServiceApplication`, `application.yml` with production-safe
  defaults (all AI providers disabled unless explicitly configured), health endpoint only.
- **Domain model**: `AuraDocument` → `AuraDocumentVersion` (the actual unit of approval/status/
  retrieval-eligibility) → `AuraChunk` → `AuraEmbedding` (separate table — see its Javadoc for
  why), plus `AuraIngestionJob` tracking a chunk+embed run.
- **pgvector**: Flyway `V1` installs the `vector` extension (trusted since pgvector 0.5.0, no
  superuser step needed) and an `hnsw` index over `aura_embeddings.embedding vector(1536)`. A
  small custom Hibernate `UserType` (`VectorType`) maps it to a plain Java `float[]`.
  `pgvector/pgvector:pg16` is the Postgres image (local dev compose and Testcontainers ITs).
- **Provider abstractions**: `ChatGenerationProvider`, `EmbeddingProvider`, `RerankingProvider` —
  business code depends only on these interfaces. Only the production-safe *disabled* default
  implementations ship in `src/main`; a real provider adapter is a later milestone's
  `@Configuration`, added without touching these interfaces or their consumers. A deterministic
  test-only stub (`StubEmbeddingProvider`) lives in `src/test` specifically so it can never be
  shipped or accidentally enabled in production.
- **Retrieval boundary enforced at the query layer**: `AuraDocumentVersionRepository`/
  `AuraChunkRepository` each expose a `findAllRetrievable()` query requiring
  `active = true AND visibility = PUBLIC AND status = INDEXED` — not only a prompting rule.
- **Ingestion pipeline (minimal)**: `ChunkingService` (simple paragraph packing) +
  `IngestionService` (chunk → embed → persist → mark version `INDEXED`), enough to prove the
  pgvector persistence path end to end. No HTTP surface, no scheduling, no re-indexing workflow.

## What deliberately does NOT exist yet

No chat/ingestion HTTP controller, no conversation/message/feedback tables, no
knowledge-gap tracking, no project-discovery state, no real (non-disabled) provider adapter, no
reranking implementation, no admin UI for approving documents. None of these are required by the
A0/A1 acceptance gate (foundation only) — see the milestone's own "architectural safeguards"
list for what was explicitly out of scope this round.
