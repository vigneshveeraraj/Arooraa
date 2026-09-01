-- pgvector 0.5.0+ marks the `vector` extension "trusted", so a normal app role with CREATE
-- privilege on the schema (not a superuser) can install it — no separate superuser bootstrap
-- step needed beyond what already runs this migration.
CREATE EXTENSION IF NOT EXISTS vector;

-- The stable identity of one knowledge document. Never carries content/status itself — every
-- fact lives on a version row (see aura_document_versions) so history stays auditable.
CREATE TABLE aura_documents (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    domain VARCHAR(50),
    category VARCHAR(50),
    product VARCHAR(50),
    service VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

-- One versioned revision of a document. A new edit is a new row, never an in-place update.
-- status: DRAFT -> IN_REVIEW -> APPROVED -> INDEXED, or ARCHIVED once superseded.
-- visibility: PUBLIC | INTERNAL — Aura's retrieval path must only ever read PUBLIC rows.
CREATE TABLE aura_document_versions (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES aura_documents(id),
    version_number INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    product_status VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT FALSE,
    source_url VARCHAR(500),
    effective_from TIMESTAMPTZ,
    raw_content TEXT NOT NULL,
    approved_by VARCHAR(200),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    UNIQUE (document_id, version_number)
);

-- Exactly one active version per document — this is the domain invariant "activate()" relies on;
-- enforced here, not only in application code, so it holds even under concurrent writes.
CREATE UNIQUE INDEX idx_aura_document_versions_one_active
    ON aura_document_versions (document_id)
    WHERE active = TRUE;

CREATE INDEX idx_aura_document_versions_document ON aura_document_versions (document_id);

-- Supports the retrieval-eligibility query (active + PUBLIC + INDEXED) directly.
CREATE INDEX idx_aura_document_versions_retrieval
    ON aura_document_versions (visibility, status)
    WHERE active = TRUE;

-- One retrieval-sized slice of an approved version's content. Holds only text — the vector is a
-- separate table (aura_embeddings) so re-embedding never touches/duplicates the source text.
CREATE TABLE aura_chunks (
    id UUID PRIMARY KEY,
    document_version_id UUID NOT NULL REFERENCES aura_document_versions(id),
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    token_count INT,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (document_version_id, chunk_index)
);

CREATE INDEX idx_aura_chunks_version ON aura_chunks (document_version_id);

-- The embedding vector for one chunk. 1536 dimensions matches common current embedding models;
-- changing provider/model to a different dimensionality needs a follow-up migration — pgvector's
-- ANN indexes need a fixed width per column, so this is not modeled as dimension-agnostic.
CREATE TABLE aura_embeddings (
    id UUID PRIMARY KEY,
    chunk_id UUID NOT NULL UNIQUE REFERENCES aura_chunks(id),
    embedding_model VARCHAR(100) NOT NULL,
    dimensions INT NOT NULL,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

-- HNSW over ivfflat: no row-count "lists" tuning parameter needed at creation time (ivfflat's
-- recommended list count depends on table size, which is awkward for a corpus that starts empty
-- and grows via ongoing approvals), and hnsw generally gives better recall/latency for this kind
-- of incrementally-growing knowledge base.
CREATE INDEX idx_aura_embeddings_vector ON aura_embeddings USING hnsw (embedding vector_cosine_ops);

-- One chunk+embed run for a single document version. Deliberately minimal — proves the pipeline
-- is auditable, not a production job-queue system.
CREATE TABLE aura_ingestion_jobs (
    id UUID PRIMARY KEY,
    document_version_id UUID NOT NULL REFERENCES aura_document_versions(id),
    status VARCHAR(20) NOT NULL,
    chunk_count INT,
    error_message VARCHAR(500),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_aura_ingestion_jobs_version ON aura_ingestion_jobs (document_version_id);
