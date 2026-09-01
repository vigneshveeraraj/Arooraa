# Aura service architecture (A0/A1 foundation + A2 retrieval)

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

## What A2 added (knowledge ingestion + hybrid retrieval)

- **Import → approval → ingestion → activation pipeline**: `KnowledgeDocumentParser` (hand-written
  frontmatter parser, rejects malformed sources), `KnowledgeImportService` (checksum-idempotent —
  unchanged source re-import is a no-op; changed content becomes a new version, never an in-place
  edit), `KnowledgeApprovalService` (the human-in-the-loop gate; import never auto-approves),
  `IngestionService` (now guards `APPROVED`-only, idempotent for already-`INDEXED` versions,
  classifies provider failures transient-vs-permanent), `KnowledgeActivationService` (publishes an
  `INDEXED` version as current, deactivating its predecessor).
- **Heading-aware deterministic chunking**: `ChunkingService` splits at markdown headings, packs
  paragraphs to a configurable target size with configurable overlap (never across a section
  boundary), hard-splits only a single oversized paragraph as last resort, and fingerprints every
  chunk (SHA-256) with best-effort source offsets.
- **One real provider adapter**: `OpenAiEmbeddingProvider` behind the unchanged
  `EmbeddingProvider` interface — config-selected (`aura.provider.embedding.provider=openai` +
  `OPENAI_API_KEY`), bounded retry with transient/permanent error classification, no OpenAI type
  visible outside `provider.openai`. Misconfiguration (enabled but no key) falls back to the
  disabled provider with a warning; the app always starts.
- **Hybrid retrieval**: `VectorSearchRepository` (pgvector cosine/HNSW) + `LexicalSearchRepository`
  (Postgres full-text over chunk text/heading + document title/product/service, GIN-indexed) fused
  by Reciprocal Rank Fusion (`RrfFusion`, k=60 — deterministic, no tuned weights), orchestrated by
  `HybridRetrievalService`, which degrades to lexical-only when no embedding provider is enabled.
- **Evidence gate**: `EvidenceGateService` classifies STRONG/WEAK/NO_EVIDENCE against provisional,
  configurable thresholds over an RRF-normalized 0..1 score — explicitly unmeasured/untuned; see
  the A2 report.
- **Common-platform extension points**: `AuraDocument.knowledgeSpace` (default `AROORAA_PUBLIC`) +
  `AssistantProfile`/`Channel`/`AccessPolicy` (`PublicWebsiteAccessPolicy`, fail-closed). Both
  search repositories enforce `active + PUBLIC + INDEXED + authorized knowledge space` in SQL.

## What deliberately does NOT exist yet

No chat/ingestion HTTP controller (ingestion runs via services driven by tests/local tooling —
there is deliberately no knowledge-mutation endpoint at all), no conversation/message/feedback
tables, no knowledge-gap tracking, no project-discovery state, no real chat-generation or
reranking adapter (the RRF-fused order is A2's deterministic ranking baseline; `RerankingProvider`
stays a disabled-by-default extension point), no admin UI. LLM answer generation and the public
chat surface come only after retrieval quality is accepted.
