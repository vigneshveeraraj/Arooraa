-- W3.4: durable notification outbox for Contact alerting — structurally identical to
-- job_application_notification_outbox / project_enquiry_notification_outbox, kept as its own
-- table/FK so Contact notification volume and failures never mix with recruitment or sales.

CREATE TABLE contact_message_notification_outbox (
    id                       UUID PRIMARY KEY,
    contact_message_id       UUID NOT NULL REFERENCES contact_messages (id),

    -- CUSTOMER_ACKNOWLEDGEMENT | INTERNAL_CONTACT_ALERT.
    notification_type        VARCHAR(30) NOT NULL,

    status                    VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempt_count             INT NOT NULL DEFAULT 0,
    next_attempt_at           TIMESTAMPTZ NOT NULL,

    created_at                TIMESTAMPTZ NOT NULL,
    updated_at                TIMESTAMPTZ NOT NULL,

    processing_started_at     TIMESTAMPTZ,
    sent_at                   TIMESTAMPTZ,

    last_error_code           VARCHAR(60),
    last_error_summary        VARCHAR(500),

    version                   BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX idx_contact_outbox_message_type
    ON contact_message_notification_outbox (contact_message_id, notification_type);

CREATE INDEX idx_contact_outbox_status_next_attempt
    ON contact_message_notification_outbox (status, next_attempt_at);
