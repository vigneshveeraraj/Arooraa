-- A2: additive-only extension of the V1 schema (V1 is never modified once committed) — adds the
-- metadata needed for idempotent import, deterministic chunking, provenance-tracked embeddings,
-- knowledge-space isolation, and full-text lexical search.

-- Knowledge-space extension point (see retrieval.context.KnowledgeSpace / AccessPolicy): which
-- searchable corpus a document belongs to. Plain text, not an enum — same reasoning as
-- domain/category/product/service on this table: future spaces (MESA_PUBLIC, MINDRA_USER_<id>)
-- are inherently dynamic/parameterized and can't be enumerated in code. A2 has exactly one.
ALTER TABLE aura_documents
    ADD COLUMN knowledge_space VARCHAR(50) NOT NULL DEFAULT 'AROORAA_PUBLIC';

CREATE INDEX idx_aura_documents_knowledge_space ON aura_documents (knowledge_space);

-- Lexical search over document-level metadata (title/product/service) — paired with the
-- chunk-level index below via an OR in the query, so each side has its own matching expression
-- index (a combined cross-table expression can't be indexed directly).
CREATE INDEX idx_aura_documents_fts ON aura_documents
    USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(product, '') || ' ' || coalesce(service, '')));

-- Import provenance + idempotency: lets repeated ingestion of an unchanged source file be a
-- no-op (compare content_checksum against the document's latest version) instead of creating a
-- duplicate version every run.
ALTER TABLE aura_document_versions
    ADD COLUMN source_path VARCHAR(500),
    ADD COLUMN content_checksum VARCHAR(64) NOT NULL DEFAULT '';

CREATE INDEX idx_aura_document_versions_checksum ON aura_document_versions (document_id, content_checksum);

-- Chunking metadata: section_heading preserves heading/section context (frozen chunking
-- requirement); checksum is the chunk's own stable fingerprint; char_start/char_end are source
-- offsets into the version's raw_content, kept for citation/debugging (best-effort under overlap
-- — see ChunkingService).
ALTER TABLE aura_chunks
    ADD COLUMN section_heading VARCHAR(300),
    ADD COLUMN checksum VARCHAR(64) NOT NULL DEFAULT '',
    ADD COLUMN char_start INT,
    ADD COLUMN char_end INT;

CREATE INDEX idx_aura_chunks_fts ON aura_chunks
    USING gin (to_tsvector('english', coalesce(section_heading, '') || ' ' || content));

-- Embedding provenance: which provider/generation produced this vector, so a future dimension or
-- model change is a new generation rather than an ambiguous in-place mutation of existing rows.
-- embedding_model already exists (V1); provider and generation are new.
ALTER TABLE aura_embeddings
    ADD COLUMN provider VARCHAR(50) NOT NULL DEFAULT 'unknown',
    ADD COLUMN generation INT NOT NULL DEFAULT 1;
