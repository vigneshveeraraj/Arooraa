-- A3: the minimum needed to hold a real conversation and be able to audit what Aura said.
-- Deliberately NOT stored anywhere in here: the composed system prompt, policy text, provider
-- credentials or headers, retrieval internals (vectors, similarities, thresholds, chunk ids).
-- A conversation is a transcript, never a knowledge source — nothing in this schema is reachable
-- from the retrieval path (see aura_documents/aura_chunks), so conversations can never be
-- indexed or retrieved as evidence.

-- One chat session. public_id is the only identifier ever handed to a client; the surrogate PK
-- stays internal so a leaked/guessed URL identifier can be rotated without touching foreign keys.
CREATE TABLE aura_conversations (
    id UUID PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    assistant_profile VARCHAR(64) NOT NULL,
    channel VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

-- One turn. sequence is dense and per-conversation so bounded history ("last N turns") is an
-- index scan, not a timestamp sort, and so ordering is stable even for messages written in the
-- same millisecond. mode/evidence_level/language/tone are recorded for assistant turns only —
-- they are what makes a past answer explainable after the fact.
CREATE TABLE aura_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES aura_conversations(id) ON DELETE CASCADE,
    sequence INT NOT NULL,
    role VARCHAR(16) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(16),
    tone VARCHAR(16),
    mode VARCHAR(32),
    evidence_level VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (conversation_id, sequence)
);

CREATE INDEX idx_aura_messages_conversation ON aura_messages (conversation_id, sequence);

-- The public source references shown with a grounded answer. Only visitor-safe fields are kept
-- (title, section heading, public URL) — never document/chunk ids, knowledge space internals or
-- evidence text, so this table can be read out to a client verbatim without a redaction step.
CREATE TABLE aura_message_sources (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES aura_messages(id) ON DELETE CASCADE,
    position INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    section_heading VARCHAR(300),
    source_url VARCHAR(500),
    UNIQUE (message_id, position)
);

CREATE INDEX idx_aura_message_sources_message ON aura_message_sources (message_id);

-- Retention/cleanup is deliberately not implemented yet (no job, no scheduler). These indexes are
-- what a future cleanup would need: delete conversations older than a cutoff, and let ON DELETE
-- CASCADE remove their messages and sources.
CREATE INDEX idx_aura_conversations_created_at ON aura_conversations (created_at);
