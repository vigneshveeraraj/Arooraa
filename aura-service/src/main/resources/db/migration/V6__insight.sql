-- A7: enough operational memory to make Aura better, and deliberately not enough to profile anyone.
--
-- Three tables, and one rule that shapes all of them: nothing here is a person. There is no IP
-- address, no device fingerprint, no user agent, no cookie, no identifier that outlives a
-- conversation, and nothing that could be joined across conversations to make one. What is kept is
-- what a question was about and how well Aura answered it.
--
-- Deliberately NOT stored: prompts, system instructions, policy text, retrieved evidence, provider
-- names, model names, similarity scores, thresholds, API keys, or the text of any answer.

-- One row per thing worth counting. The dimensions are a fixed, small set of enums and one bounded
-- code — never free text from a visitor, and never anything a model produced.
CREATE TABLE aura_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(48) NOT NULL,

    -- Which conversation, so a funnel can be counted end to end. Nullable because some events
    -- belong to no conversation, and it is a foreign key so a deleted conversation takes its
    -- events with it: retention is decided once, on the conversation, and everything follows.
    conversation_id UUID REFERENCES aura_conversations(id) ON DELETE CASCADE,

    mode VARCHAR(32),
    evidence_level VARCHAR(32),
    language VARCHAR(16),
    channel VARCHAR(32),

    -- The canonical subject of the page the visitor was on, from the fixed route registry — never
    -- the raw path a client sent, and never a URL.
    page_subject VARCHAR(120),

    latency_ms BIGINT,

    -- A short stable code: a guardrail name, a provider failure kind, a refusal reason. Bounded
    -- and drawn from our own vocabulary, so it can never carry a visitor's words or a provider's.
    detail VARCHAR(64),

    occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_aura_events_type_time ON aura_events (event_type, occurred_at);
CREATE INDEX idx_aura_events_conversation ON aura_events (conversation_id);

-- A question Aura could not answer from approved knowledge, aggregated rather than logged: one row
-- per distinct question, with a count, so "forty people asked this" is a single fact rather than
-- forty rows to notice.
--
-- The question text is kept normalised, because a gap nobody can read is a gap nobody can fill —
-- and it is not a new exposure: the same words are already in aura_messages, which this row's
-- conversation cascade will delete alongside it.
CREATE TABLE aura_knowledge_gaps (
    id UUID PRIMARY KEY,

    -- sha-256 of the normalised question and the assistant profile. Unique, and the whole
    -- aggregation mechanism: the same question asked again finds this row instead of making one.
    fingerprint VARCHAR(64) NOT NULL UNIQUE,

    question TEXT NOT NULL,
    assistant_profile VARCHAR(64) NOT NULL,
    page_subject VARCHAR(120),
    evidence_level VARCHAR(32) NOT NULL,

    occurrences INT NOT NULL DEFAULT 1,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,

    -- OPEN until a person decides what to do about it. Nothing here ever becomes knowledge on its
    -- own: there is no path from this table into ingestion, and approval stays a human act.
    status VARCHAR(32) NOT NULL,
    -- Where the answer ended up, once somebody wrote one — a document slug, usually.
    resolution_reference VARCHAR(200),

    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_aura_knowledge_gaps_status ON aura_knowledge_gaps (status, occurrences DESC);

-- Was that answer any use? One vote per turn, changeable, with an optional sentence.
CREATE TABLE aura_feedback (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES aura_conversations(id) ON DELETE CASCADE,
    message_sequence INT NOT NULL,

    rating VARCHAR(16) NOT NULL,
    -- Optional, short, and the visitor's own words. Bounded so it stays a reason rather than
    -- becoming a second conversation nobody is reading.
    reason VARCHAR(300),

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,

    -- One vote per answer. Changing your mind updates this row rather than adding another, so a
    -- count of "not helpful" is a count of answers rather than of clicks.
    UNIQUE (conversation_id, message_sequence)
);

CREATE INDEX idx_aura_feedback_rating ON aura_feedback (rating, created_at);
