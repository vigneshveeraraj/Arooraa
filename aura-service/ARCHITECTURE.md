# Aura service architecture (A0/A1 foundation + A2 retrieval + A2.1 calibration)

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
- **Evidence gate (superseded by A2.1 — see below)**: originally classified on a normalized RRF
  score.
- **Common-platform extension points**: `AuraDocument.knowledgeSpace` (default `AROORAA_PUBLIC`) +
  `AssistantProfile`/`Channel`/`AccessPolicy` (`PublicWebsiteAccessPolicy`, fail-closed). Both
  search repositories enforce `active + PUBLIC + INDEXED + authorized knowledge space` in SQL.

## What A2.1 fixed (evidence-gate hardening + real-provider calibration)

- **The A2 defect**: RRF score is a function of rank alone, so the best available chunk is rank 1
  whether it is excellent or irrelevant — on a small corpus, "what database does MESA use
  internally?" scored a perfect normalized RRF score and read as STRONG_EVIDENCE despite no such
  fact existing anywhere in the corpus. Frozen rule going forward: **RRF orders results; it must
  never determine confidence.**
- **Absolute-relevance evidence gate**: `EvidenceGateService` now classifies from
  `RelevanceSignals` — raw cosine similarity of the top chunk, `QueryTermCoverage` (an explainable,
  stemming-free fraction of the query's meaningful words present in the evidence text), and
  cross-signal agreement — never from RRF rank or score. Thresholds
  (`aura.retrieval.evidence.*-vector-similarity` / `*-query-term-coverage`) are measured and
  configurable, not intuited; see the A2.1 report for the calibration data.
- **Embedding generations**: `aura_embeddings` now allows one vector per `(chunk, generation)`
  (Flyway `V3`, additive), so a real-provider re-embedding run coexists with the prior stub
  cohort instead of overwriting it. `aura.provider.embedding.generation` selects which cohort
  ingestion writes and retrieval searches; `IngestionService.reembed` re-embeds an already-INDEXED
  version's existing chunks at the current generation without re-chunking.
- **Real embedding calibration**: `EmbeddingCalibrationIT` runs the same evaluation sets against
  the real `OpenAiEmbeddingProvider`, gated on `OPENAI_API_KEY` actually being present
  (`@EnabledIfEnvironmentVariable`) so it never runs, and never blocks, a secretless build.
- **Retrieval-relevant metadata versioning fix**: A2's import fingerprint hashed the raw source
  file, so a visibility or product-status change wasn't guaranteed to create a new version, and
  `AuraDocument`'s own title/product/service could silently drift from the source. `KnowledgeImportService`
  now fingerprints (`DocumentFingerprint`) an explicit, field-labelled projection of every
  retrieval-relevant field plus the body, and refreshes the document's editorial metadata
  (`AuraDocument.updateEditorialMetadata`) on every import.
- **Policy vs. public knowledge**: Aura's own policy documents (`90`–`95`) now declare
  `knowledge_space: AURA_POLICY` in addition to `visibility: INTERNAL` — two independent controls,
  so a mislabelled visibility alone still can't make policy content ordinary visitor-retrievable
  RAG evidence. `KnowledgeSpaces` (knowledge domain) is the single canonical definition;
  `retrieval.context.KnowledgeSpace` re-exports it rather than keeping a second copy in sync.
- **Adversarial and evaluation fixtures**: `EvaluationSets` centralizes the positive/negative/
  internal-boundary/multilingual/adversarial-token query sets so the secretless acceptance run and
  the real-provider calibration run measure identically; `AdversarialRetrievalIT` proves the three
  synthetic tokens are excluded at the lexical and vector layers independently, not only through
  fusion.

## What deliberately does NOT exist yet

No chat/ingestion HTTP controller (ingestion runs via services driven by tests/local tooling —
there is deliberately no knowledge-mutation endpoint at all), no conversation/message/feedback
tables, no knowledge-gap tracking, no project-discovery state, no real chat-generation or
reranking adapter (the RRF-fused order is A2's deterministic ranking baseline; `RerankingProvider`
stays a disabled-by-default extension point), no admin UI. LLM answer generation and the public
chat surface come only after retrieval quality is accepted.
