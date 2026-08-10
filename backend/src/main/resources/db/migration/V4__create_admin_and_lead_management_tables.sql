CREATE TABLE admin_users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(254) NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ,
    CONSTRAINT uq_admin_users_email UNIQUE (email)
);

-- One overlay row per (lead_type, lead_id) pair. lead_id is a logical foreign key into
-- either demo_requests.id or project_enquiries.id depending on lead_type — there is no
-- DB-level FK here on purpose, since a single column can't reference two different
-- tables and this table must not force those two domain tables together.
CREATE TABLE lead_management (
    id                          UUID PRIMARY KEY,
    lead_type                   VARCHAR(20) NOT NULL,
    lead_id                     UUID NOT NULL,
    assigned_admin_id           UUID REFERENCES admin_users (id),
    follow_up_at                TIMESTAMPTZ,
    estimated_value             NUMERIC(14, 2),
    estimated_value_currency    VARCHAR(3),
    lost_reason                 VARCHAR(30),
    internal_summary            VARCHAR(2000),
    last_contacted_at           TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    version                     BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_lead_management_lead UNIQUE (lead_type, lead_id)
);

CREATE INDEX idx_lead_management_follow_up_at ON lead_management (follow_up_at) WHERE follow_up_at IS NOT NULL;
CREATE INDEX idx_lead_management_assigned_admin_id ON lead_management (assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;

CREATE TABLE lead_notes (
    id              UUID PRIMARY KEY,
    lead_type       VARCHAR(20) NOT NULL,
    lead_id         UUID NOT NULL,
    admin_user_id   UUID NOT NULL REFERENCES admin_users (id),
    note            VARCHAR(4000) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_notes_lead ON lead_notes (lead_type, lead_id);

CREATE TABLE lead_activity (
    id                  UUID PRIMARY KEY,
    lead_type           VARCHAR(20) NOT NULL,
    lead_id             UUID NOT NULL,
    actor_admin_id      UUID REFERENCES admin_users (id),
    activity_type       VARCHAR(30) NOT NULL,
    old_value           VARCHAR(200),
    new_value           VARCHAR(200),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_activity_lead ON lead_activity (lead_type, lead_id, created_at);
