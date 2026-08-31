-- W3.2C: durable notification outbox for post-persistence lead alerting. Purely additive —
-- no existing table/column changes. Each row is one delivery intent for an already-persisted
-- ProjectEnquiry; the outbox never duplicates the enquiry payload, only references it by id.

CREATE TABLE project_enquiry_notification_outbox (
    id UUID PRIMARY KEY,
    project_enquiry_id UUID NOT NULL REFERENCES project_enquiries (id),

    -- CUSTOMER_ACKNOWLEDGEMENT | INTERNAL_SALES_ALERT (W3.2C §8). Deliberately not a FK to a
    -- lookup table — this is a small, code-controlled enum, not open-ended reference data.
    notification_type VARCHAR(30) NOT NULL,

    -- PENDING | PROCESSING | SENT | RETRY | FAILED. Independent from EnquiryStatus — a lead can
    -- stay NEW while its acknowledgement email is RETRY; see NotificationOutboxStatus.
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    attempt_count INT NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    -- Set only while a worker transaction holds this row's lock (see
    -- NotificationOutboxProcessor); the claim+send+finalize path never commits a transaction
    -- that leaves a row sat in PROCESSING, so a crashed worker's held Postgres row lock is
    -- simply released on connection loss and the row reverts to PENDING/RETRY for the next
    -- worker to pick up — no separate stale-lease sweep is required. Kept as a column anyway
    -- for operational visibility (W3.2C §7, §36).
    processing_started_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,

    last_error_code VARCHAR(60),
    last_error_summary VARCHAR(500),

    version BIGINT NOT NULL DEFAULT 0
);

-- At most one active logical notification per (enquiry, type) — guards against duplicate
-- intents from a buggy caller; the application itself only ever inserts each pair once per
-- newly-created enquiry (idempotency replays and legacy duplicate-heuristic hits never reach
-- the code path that creates outbox rows at all, so this is a safety net, not the primary
-- dedup mechanism).
CREATE UNIQUE INDEX idx_notification_outbox_enquiry_type
    ON project_enquiry_notification_outbox (project_enquiry_id, notification_type);

-- Worker polling: "give me eligible rows, oldest due first."
CREATE INDEX idx_notification_outbox_status_next_attempt
    ON project_enquiry_notification_outbox (status, next_attempt_at);
