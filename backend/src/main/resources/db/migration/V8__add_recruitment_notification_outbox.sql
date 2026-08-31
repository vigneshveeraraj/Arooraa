-- W3.3B: durable notification outbox for recruitment alerting — structurally identical to
-- project_enquiry_notification_outbox (same PENDING/PROCESSING/SENT/RETRY/FAILED claim
-- pattern) but kept as its own table/FK so recruitment notification volume, retries and
-- failures never mix with sales-lead notifications. Purely additive.

CREATE TABLE job_application_notification_outbox (
    id                       UUID PRIMARY KEY,
    job_application_id       UUID NOT NULL REFERENCES job_applications (id),

    -- CANDIDATE_ACKNOWLEDGEMENT | INTERNAL_RECRUITMENT_ALERT.
    notification_type        VARCHAR(30) NOT NULL,

    status                   VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempt_count            INT NOT NULL DEFAULT 0,
    next_attempt_at          TIMESTAMPTZ NOT NULL,

    created_at               TIMESTAMPTZ NOT NULL,
    updated_at                TIMESTAMPTZ NOT NULL,

    -- Same crash-safety reasoning as project_enquiry_notification_outbox: a worker never
    -- commits a transaction leaving a row sat in PROCESSING, so a crashed worker's held
    -- Postgres row lock simply releases on connection loss and the row reverts to
    -- PENDING/RETRY for the next worker — no separate stale-lease sweep required.
    processing_started_at    TIMESTAMPTZ,
    sent_at                  TIMESTAMPTZ,

    last_error_code          VARCHAR(60),
    last_error_summary       VARCHAR(500),

    version                  BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX idx_recruitment_outbox_application_type
    ON job_application_notification_outbox (job_application_id, notification_type);

CREATE INDEX idx_recruitment_outbox_status_next_attempt
    ON job_application_notification_outbox (status, next_attempt_at);
