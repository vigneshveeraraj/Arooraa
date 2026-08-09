-- Counter table backing human-readable enquiry numbers (ARO-2026-000001).
-- A row per calendar year; incremented atomically via INSERT ... ON CONFLICT DO UPDATE
-- ... RETURNING in EnquiryNumberGenerator, so it is safe under concurrent inserts and
-- survives application restarts (unlike an in-memory counter).
CREATE TABLE project_enquiry_number_counters (
    year        INT PRIMARY KEY,
    last_value  BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE project_enquiries (
    id                          UUID PRIMARY KEY,
    enquiry_number              VARCHAR(20) NOT NULL,
    name                        VARCHAR(100) NOT NULL,
    company_name                VARCHAR(150),
    business_email              VARCHAR(254) NOT NULL,
    phone                       VARCHAR(30) NOT NULL,
    normalized_phone            VARCHAR(20) NOT NULL,
    country                     VARCHAR(100) NOT NULL,
    service_type                VARCHAR(40) NOT NULL,
    project_type                VARCHAR(40) NOT NULL,
    description                 VARCHAR(3000) NOT NULL,
    existing_system             BOOLEAN NOT NULL,
    budget_range                VARCHAR(30) NOT NULL,
    timeline                    VARCHAR(30) NOT NULL,
    preferred_contact_method    VARCHAR(20) NOT NULL,
    source                      VARCHAR(50),
    source_page                 VARCHAR(500),
    referrer                    VARCHAR(1000),
    utm_source                  VARCHAR(200),
    utm_medium                  VARCHAR(200),
    utm_campaign                VARCHAR(200),
    status                      VARCHAR(20) NOT NULL DEFAULT 'NEW',
    ip_hash                     VARCHAR(64) NOT NULL,
    user_agent                  VARCHAR(500),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_enquiries_enquiry_number UNIQUE (enquiry_number)
);

-- enquiry_number already has a unique index via the constraint above; no extra index added.
CREATE INDEX idx_project_enquiries_status ON project_enquiries (status);
CREATE INDEX idx_project_enquiries_created_at ON project_enquiries (created_at);
CREATE INDEX idx_project_enquiries_normalized_phone ON project_enquiries (normalized_phone);
CREATE INDEX idx_project_enquiries_business_email ON project_enquiries (business_email);
