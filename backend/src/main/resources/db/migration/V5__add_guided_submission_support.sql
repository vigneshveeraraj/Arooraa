-- W3.2B: additive support for the frontend-v2 guided Start Project flow, alongside the
-- original flat-form contract. No existing column is renamed or removed, and no existing
-- row's data changes shape — this only adds room for a second submission shape to coexist.

-- The original form's own fields were always required together (serviceType, projectType,
-- description, existingSystem, budgetRange, timeline). Guided rows don't populate them — a
-- deterministic mapping from the guided flow's richer fields onto these would be invented,
-- not derived, so guided rows leave them null instead. LEGACY submissions still require them;
-- that's enforced in the application layer (ProjectEnquiryCreateRequest/ProjectEnquiryService),
-- not the database, once two submission shapes share one table.
ALTER TABLE project_enquiries ALTER COLUMN service_type DROP NOT NULL;
ALTER TABLE project_enquiries ALTER COLUMN project_type DROP NOT NULL;
ALTER TABLE project_enquiries ALTER COLUMN description DROP NOT NULL;
ALTER TABLE project_enquiries ALTER COLUMN existing_system DROP NOT NULL;
ALTER TABLE project_enquiries ALTER COLUMN budget_range DROP NOT NULL;
ALTER TABLE project_enquiries ALTER COLUMN timeline DROP NOT NULL;

ALTER TABLE project_enquiries
    ADD COLUMN submission_version VARCHAR(10) NOT NULL DEFAULT 'LEGACY',
    ADD COLUMN country_code VARCHAR(4),
    ADD COLUMN role VARCHAR(100),

    -- Guided-only structured fields. Named distinctly from the legacy columns above
    -- (guided_timeline/guided_budget_range, not timeline/budget_range) because the value
    -- sets genuinely differ between the two eras' enums — see GuidedTimeline/GuidedBudgetRange.
    ADD COLUMN solution_model VARCHAR(40),
    ADD COLUMN engagement_model VARCHAR(40),
    ADD COLUMN problem_statement VARCHAR(3000),
    ADD COLUMN project_stage VARCHAR(40),
    ADD COLUMN guided_timeline VARCHAR(30),
    ADD COLUMN guided_budget_range VARCHAR(30),
    ADD COLUMN existing_system_context VARCHAR(3000),

    ADD COLUMN preferred_contact_time VARCHAR(20),
    ADD COLUMN whatsapp_consent BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN whatsapp_consent_at TIMESTAMPTZ,

    -- Additive attribution fields alongside the existing source/source_page/referrer/
    -- utm_source/utm_medium/utm_campaign columns, which both submission shapes keep sharing.
    ADD COLUMN source_context VARCHAR(60),
    ADD COLUMN entry_route VARCHAR(500),
    ADD COLUMN utm_content VARCHAR(200),

    -- Idempotency-key support (distinct from the existing time-window duplicate heuristic,
    -- which stays in place unchanged for legacy callers that never send a key). fingerprint
    -- is a hash of the logical payload, stored to detect same-key/different-payload reuse —
    -- never a hash of anything logged in plaintext.
    ADD COLUMN idempotency_key VARCHAR(100),
    ADD COLUMN request_fingerprint VARCHAR(64);

-- One or more product types per guided enquiry (brief's own stated preference over a
-- delimited string column). Legacy rows never populate this table.
CREATE TABLE project_enquiry_product_types (
    enquiry_id UUID NOT NULL REFERENCES project_enquiries (id),
    product_type VARCHAR(60) NOT NULL,
    PRIMARY KEY (enquiry_id, product_type)
);

-- Partial unique index: only enforces uniqueness where a key was actually supplied, so the
-- many legacy rows with no idempotency key (all of them, until frontend-v2 goes live) don't
-- collide with each other under a plain UNIQUE constraint.
CREATE UNIQUE INDEX idx_project_enquiries_idempotency_key
    ON project_enquiries (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_project_enquiries_submission_version ON project_enquiries (submission_version);
