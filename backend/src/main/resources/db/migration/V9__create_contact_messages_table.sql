-- W3.4: general Contact ("I need to contact AROORAA about something else") — additive only,
-- no change to any existing table. Deliberately separate from project_enquiries, demo_requests,
-- job_applications and talent_subscriptions: a general contact message is not a sales lead, a
-- recruitment application, or a talent-community subscription.

CREATE TABLE contact_message_reference_counters (
    year        INT PRIMARY KEY,
    last_value  BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE contact_messages (
    id                      UUID PRIMARY KEY,
    contact_reference       VARCHAR(20) NOT NULL,

    name                    VARCHAR(100) NOT NULL,
    email                   VARCHAR(254) NOT NULL,
    phone                   VARCHAR(30),
    company                 VARCHAR(150),

    -- GENERAL | PARTNERSHIP | PRODUCT_QUESTION | BUSINESS_ENQUIRY | MEDIA | CAREERS | OTHER.
    -- Deliberately never includes a "start a project" value — that intent is routed to
    -- /start-project entirely, not modeled here.
    reason                  VARCHAR(30) NOT NULL,

    -- Only meaningful when reason = PRODUCT_QUESTION; always optional at the API level (the
    -- frontend decides when to ask for it, the backend never requires it regardless of reason).
    product                 VARCHAR(30),

    message                 VARCHAR(2000) NOT NULL,

    -- NEW today; UNDER_REVIEW/RESPONDED/CLOSED are modeled for a future admin milestone but
    -- never set by this one — no contact-admin workflow exists yet (W3.4 §9).
    status                  VARCHAR(20) NOT NULL DEFAULT 'NEW',

    -- Idempotency (W3.4 §12) — same replay-vs-conflict mechanism as project_enquiries/job_applications.
    idempotency_key          VARCHAR(100),
    request_fingerprint      VARCHAR(64),

    ip_hash                  VARCHAR(64) NOT NULL,

    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                   BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uq_contact_messages_reference UNIQUE (contact_reference)
);

CREATE UNIQUE INDEX uq_contact_messages_idempotency_key
    ON contact_messages (idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_contact_messages_status ON contact_messages (status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages (created_at);
