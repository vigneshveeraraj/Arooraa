-- W3.3B: recruitment domain — additive only, no change to any existing table.
-- Deliberately separate storage from project_enquiries / demo_requests / the admin
-- lead-management tables: recruitment data must never live in sales lead storage.

-- Counter table backing human-readable application references (JOB-2026-000001),
-- same atomic-upsert pattern as project_enquiry_number_counters.
CREATE TABLE job_application_reference_counters (
    year        INT PRIMARY KEY,
    last_value  BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE job_applications (
    id                          UUID PRIMARY KEY,
    application_reference       VARCHAR(20) NOT NULL,

    -- Identity of the role applied to. job_title_snapshot is copied at submission time so
    -- the application record stays meaningful even if the frontend's job content changes
    -- later — it is never re-derived from the (frontend-owned) job dataset.
    job_slug                    VARCHAR(60) NOT NULL,
    job_title_snapshot          VARCHAR(150) NOT NULL,

    candidate_name               VARCHAR(100) NOT NULL,
    email                        VARCHAR(254) NOT NULL,
    phone                        VARCHAR(30) NOT NULL,
    current_location             VARCHAR(150),
    experience                   VARCHAR(100),
    linkedin_url                 VARCHAR(500),
    portfolio_url                VARCHAR(500),
    note                         VARCHAR(2000),

    -- Résumé is optional (matches the already-approved W3.3A frontend contract). When
    -- present, only metadata lives here — the file itself lives in private filesystem
    -- storage (see ResumeStorage); resume_storage_key is a random key, never a filename.
    resume_storage_key           VARCHAR(150),
    resume_original_filename     VARCHAR(255),
    resume_content_type          VARCHAR(100),
    resume_size                  BIGINT,

    consent_accepted             BOOLEAN NOT NULL,

    -- RECEIVED today; UNDER_REVIEW/SHORTLISTED/INTERVIEW/OFFER/HIRED/REJECTED/WITHDRAWN
    -- are modelled (see ApplicationStatus) but never set in this milestone — no admin
    -- workflow exists yet. Deliberately its own enum, never the sales EnquiryStatus.
    status                       VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',

    -- Idempotency (W3.3B §9) — same replay-vs-conflict mechanism as project_enquiries'
    -- Idempotency-Key handling, kept as this table's only duplicate-submission control
    -- (no separate time-window heuristic here).
    idempotency_key               VARCHAR(100),
    request_fingerprint           VARCHAR(64),

    ip_hash                       VARCHAR(64) NOT NULL,

    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                       BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uq_job_applications_reference UNIQUE (application_reference)
);

-- One row per Idempotency-Key value; NULL keys (legacy/keyless callers, if any) are not
-- constrained by this index at all (partial unique index).
CREATE UNIQUE INDEX uq_job_applications_idempotency_key
    ON job_applications (idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_job_applications_status ON job_applications (status);
CREATE INDEX idx_job_applications_created_at ON job_applications (created_at);

CREATE TABLE talent_subscriptions (
    id                    UUID PRIMARY KEY,
    email                 VARCHAR(254) NOT NULL,
    name                  VARCHAR(100) NOT NULL,
    experience_level      VARCHAR(40),
    consent_accepted      BOOLEAN NOT NULL,

    -- ACTIVE | UNSUBSCRIBED. No admin UI exists yet to change this in this milestone; the
    -- column exists so a future unsubscribe mechanism has somewhere to record its effect
    -- without a schema change.
    status                VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    version               BIGINT NOT NULL DEFAULT 0,

    -- One active subscription per email (W3.3B §12) — a second submission from the same
    -- address updates the existing row rather than creating a duplicate.
    CONSTRAINT uq_talent_subscriptions_email UNIQUE (email)
);

-- Structured areas of interest (W3.3B §11) — a real value set, never just the free-text
-- display label, and independent of job_applications entirely (distinct purpose/consent).
CREATE TABLE talent_subscription_areas (
    talent_subscription_id  UUID NOT NULL REFERENCES talent_subscriptions (id),
    area_of_interest        VARCHAR(30) NOT NULL,
    PRIMARY KEY (talent_subscription_id, area_of_interest)
);
