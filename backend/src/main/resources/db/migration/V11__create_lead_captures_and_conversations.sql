-- Low-friction lead capture (frontend-v2/docs/lead-capture.md) and the scripted WhatsApp
-- conversation that follows it — additive only, no change to any existing table.
--
-- Deliberately its own table rather than a project_enquiries variant: a lead capture has no
-- name or email by design, and project_enquiries requires both.

CREATE TABLE lead_captures (
    id                       UUID PRIMARY KEY,

    -- Opaque reference ("LC-7Q2M9X"): random, never sequential, never derived from the phone.
    -- It is the only lead identifier that may ever appear in a WhatsApp URL or message.
    lead_reference           VARCHAR(12) NOT NULL,

    -- WEBSITE | CUSTOMER_ENQUIRIES | AI_AUTOMATION | MARKETING_LEADS | BUSINESS_APPLICATION | NOT_SURE.
    -- Required by the web form; null only for a lead that started on WhatsApp and hasn't answered yet.
    requirement              VARCHAR(30),

    -- E.164. Web-form leads are always +91 mobiles (validated); WhatsApp-originated leads carry
    -- whatever number WhatsApp reports, so country_code may be null for those.
    phone                    VARCHAR(20) NOT NULL,
    country_code             VARCHAR(2),

    -- Consent is recorded, never inferred: the exact sentence shown (web) or the fact the
    -- customer messaged first (WhatsApp), plus when.
    consent_given            BOOLEAN NOT NULL,
    consent_text             VARCHAR(500) NOT NULL,
    -- WEB_FORM | CUSTOMER_INITIATED_CHAT (23 chars — keep the column wider than the longest value).
    consent_source           VARCHAR(30) NOT NULL,
    consent_at               TIMESTAMPTZ NOT NULL,

    -- en | ta. source_locale is the page language; preferred_language is what the customer
    -- chose in the conversation and overrides source_locale for all follow-up.
    source_locale            VARCHAR(5),
    preferred_language       VARCHAR(5),

    -- Collected by the conversation, one question at a time.
    business_type            VARCHAR(150),
    preferred_call_time      VARCHAR(20),
    handoff_requested        BOOLEAN NOT NULL DEFAULT FALSE,

    -- WEBSITE | WHATSAPP | SIMULATOR.
    source                   VARCHAR(20) NOT NULL,
    source_page              VARCHAR(500),
    referrer                 VARCHAR(500),
    utm_source               VARCHAR(100),
    utm_medium               VARCHAR(100),
    utm_campaign             VARCHAR(100),
    utm_content              VARCHAR(100),

    -- Same lifecycle vocabulary as the other admin-managed leads.
    status                   VARCHAR(20) NOT NULL DEFAULT 'NEW',

    idempotency_key          VARCHAR(100),
    request_fingerprint      VARCHAR(64),

    -- Null for WhatsApp-originated leads (no browser request involved).
    ip_hash                  VARCHAR(64),

    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                  BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uq_lead_captures_reference UNIQUE (lead_reference)
);

CREATE UNIQUE INDEX uq_lead_captures_idempotency_key
    ON lead_captures (idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_lead_captures_status ON lead_captures (status);
CREATE INDEX idx_lead_captures_created_at ON lead_captures (created_at);
CREATE INDEX idx_lead_captures_phone ON lead_captures (phone);

-- One scripted conversation per (channel, participant). participant_hash is an HMAC of the
-- participant's number (same secret as ip_hash), so a returning WhatsApp sender can be found
-- without indexing or logging the raw number.
CREATE TABLE lead_conversations (
    id                       UUID PRIMARY KEY,
    lead_capture_id          UUID REFERENCES lead_captures (id),

    -- WHATSAPP | SIMULATOR.
    channel                  VARCHAR(20) NOT NULL,
    participant_hash         VARCHAR(64) NOT NULL,

    -- AWAITING_LANGUAGE | AWAITING_REQUIREMENT | AWAITING_BUSINESS_TYPE | AWAITING_CALL_TIME |
    -- COMPLETED | HANDED_OFF.
    state                    VARCHAR(30) NOT NULL,
    language                 VARCHAR(5),
    unclear_count            INT NOT NULL DEFAULT 0,

    last_inbound_at          TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                  BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uq_lead_conversations_participant UNIQUE (channel, participant_hash)
);

CREATE INDEX idx_lead_conversations_lead ON lead_conversations (lead_capture_id);

CREATE TABLE lead_conversation_messages (
    id                       UUID PRIMARY KEY,
    conversation_id          UUID NOT NULL REFERENCES lead_conversations (id),

    -- INBOUND | OUTBOUND.
    direction                VARCHAR(10) NOT NULL,
    body                     VARCHAR(2000) NOT NULL,

    -- How the inbound text was understood: RULES | MODEL | FALLBACK. Null for outbound.
    interpreted_by           VARCHAR(10),

    -- The channel's own message id (WhatsApp "wamid…"). Unique so a redelivered webhook is a no-op.
    external_message_id      VARCHAR(200),

    created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_lead_conversation_messages_external_id
    ON lead_conversation_messages (external_message_id) WHERE external_message_id IS NOT NULL;

CREATE INDEX idx_lead_conversation_messages_conversation
    ON lead_conversation_messages (conversation_id, created_at);
