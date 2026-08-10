-- Milestone 2C: admin status updates can race across two browser tabs. Adds a plain
-- optimistic-locking counter to both existing lead tables (safe as a NOT NULL default,
-- since nothing has been deployed to production yet and there is no data to backfill).
ALTER TABLE demo_requests ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE project_enquiries ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
