-- A6: what Aura understood about a visitor's project, and whether they asked us to act on it.
--
-- One row per conversation, and only for conversations that reached a project discussion. The
-- structured fields live in a single JSON document rather than in fifteen columns: nothing here is
-- ever queried by field, the shape belongs to the extractor that produces it, and a brief whose
-- shape changes should not need a migration to say so.
--
-- Deliberately NOT stored here: anything the visitor did not say. Every field is either something
-- they told us or absent — see ProjectBriefExtractor and BriefGrounding for how that is enforced.

CREATE TABLE aura_project_briefs (
    id UUID PRIMARY KEY,
    -- One brief per conversation, and reachable only through it. A brief cannot be addressed
    -- directly, so there is no identifier for one conversation to guess another's by.
    conversation_id UUID NOT NULL UNIQUE REFERENCES aura_conversations(id) ON DELETE CASCADE,

    -- DRAFT once extracted, SUMMARISED once the visitor has actually been shown it, SUBMITTED once
    -- it has been handed to the Start Project workflow. The handoff refuses anything but
    -- SUMMARISED: nobody's project may be sent to us on the strength of a summary they never saw.
    status VARCHAR(32) NOT NULL,

    fields_json TEXT NOT NULL,

    -- Consent is a recorded fact with a time on it, not a boolean somebody set. Null until the
    -- visitor answers yes to a question asked in plain words.
    consented_at TIMESTAMPTZ,

    -- What the Start Project workflow gave back. Its presence is what makes a second submission
    -- impossible: the handoff returns this rather than creating another enquiry.
    enquiry_reference VARCHAR(64),
    submitted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_aura_project_briefs_created_at ON aura_project_briefs (created_at);
