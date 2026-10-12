-- WhatsApp Cloud API transport (ops/whatsapp-integration.md) — additive only.
--
-- Inbox: every accepted Meta message, stored by the webhook request BEFORE it answers 200 and
-- before any conversation work. A background processor turns rows into conversation turns.
-- Outbox: every guarded reply, written in the same transaction as the turn, sent later by a
-- dispatcher outside any transaction. Its id is the biz_opaque_callback_data correlation id.

CREATE TABLE whatsapp_inbound_messages (
    id                       UUID PRIMARY KEY,
    -- Arrival order; breaks ties between equal (second-granularity) Meta timestamps.
    seq                      BIGINT GENERATED ALWAYS AS IDENTITY,
    phone_number_id          VARCHAR(30) NOT NULL,
    wamid                    VARCHAR(200) NOT NULL,
    -- E.164; needed to reply. participant_hash = IpHasher("WHATSAPP:" + phone), as lead_conversations.
    participant_phone        VARCHAR(20) NOT NULL,
    participant_hash         VARCHAR(64) NOT NULL,
    body                     VARCHAR(2000) NOT NULL,
    -- SHA-256 of sender/timestamp/text: a redelivery with the same wamid but different content is
    -- detected and logged, never written over the original.
    payload_sha256           VARCHAR(64) NOT NULL,
    -- Meta's own timestamp (customer send time); the 24h window is anchored here, never on replay time.
    source_timestamp         TIMESTAMPTZ NOT NULL,
    received_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- PENDING | RETRY | PROCESSED | DEAD.
    status                   VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempt_count            INT NOT NULL DEFAULT 0,
    next_attempt_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at             TIMESTAMPTZ,
    last_error_code          VARCHAR(60),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_whatsapp_inbound_wamid UNIQUE (phone_number_id, wamid),
    CONSTRAINT ck_whatsapp_inbound_status CHECK (status IN ('PENDING', 'RETRY', 'PROCESSED', 'DEAD'))
);

CREATE INDEX idx_whatsapp_inbound_due
    ON whatsapp_inbound_messages (next_attempt_at) WHERE status IN ('PENDING', 'RETRY');
CREATE INDEX idx_whatsapp_inbound_participant
    ON whatsapp_inbound_messages (participant_hash, source_timestamp, seq);

CREATE TABLE whatsapp_outbound_messages (
    -- Local correlation id, sent to Meta as biz_opaque_callback_data.
    id                       UUID PRIMARY KEY,
    seq                      BIGINT GENERATED ALWAYS AS IDENTITY,
    inbound_message_id       UUID NOT NULL REFERENCES whatsapp_inbound_messages (id),
    conversation_message_id  UUID NOT NULL REFERENCES lead_conversation_messages (id),
    phone_number_id          VARCHAR(30) NOT NULL,
    participant_hash         VARCHAR(64) NOT NULL,
    recipient_digits         VARCHAR(15) NOT NULL,
    body                     VARCHAR(4096) NOT NULL,
    -- min(source_timestamp, received_at) of the customer message this answers.
    customer_message_at      TIMESTAMPTZ NOT NULL,
    -- PENDING | SENDING | RETRY | ACCEPTED | FAILED | UNKNOWN | EXPIRED.
    -- UNKNOWN = may have been sent; never resent automatically (operator runbook only).
    status                   VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempt_count            INT NOT NULL DEFAULT 0,
    next_attempt_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    lease_token              UUID,
    claimed_at               TIMESTAMPTZ,
    meta_message_id          VARCHAR(200),
    sent_at                  TIMESTAMPTZ,
    -- Meta delivery callbacks, monotonic: sent < delivered < read; failed only from none/sent.
    delivery_status          VARCHAR(20),
    delivery_error_code      VARCHAR(60),
    delivery_updated_at      TIMESTAMPTZ,
    last_error_code          VARCHAR(60),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_whatsapp_outbound_conversation_message UNIQUE (conversation_message_id),
    CONSTRAINT ck_whatsapp_outbound_status CHECK (status IN
        ('PENDING', 'SENDING', 'RETRY', 'ACCEPTED', 'FAILED', 'UNKNOWN', 'EXPIRED')),
    CONSTRAINT ck_whatsapp_outbound_delivery CHECK (delivery_status IS NULL OR delivery_status IN
        ('sent', 'delivered', 'read', 'failed'))
);

CREATE UNIQUE INDEX uq_whatsapp_outbound_meta_id
    ON whatsapp_outbound_messages (meta_message_id) WHERE meta_message_id IS NOT NULL;
CREATE INDEX idx_whatsapp_outbound_due
    ON whatsapp_outbound_messages (next_attempt_at) WHERE status IN ('PENDING', 'RETRY');
CREATE INDEX idx_whatsapp_outbound_participant
    ON whatsapp_outbound_messages (participant_hash, seq);
CREATE INDEX idx_whatsapp_outbound_sending
    ON whatsapp_outbound_messages (claimed_at) WHERE status = 'SENDING';
