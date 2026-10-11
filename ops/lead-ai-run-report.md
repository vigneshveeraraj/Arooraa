# Lead capture + AI conversation — run report

Branch: feature/tamil-growth-campaign · Started: 2026-10-11

## Log
- [start] Audited state. Uncommitted: SecurityConfig, GlobalExceptionHandler, application.yml (modified);
  capture/ package (43 files), V11 migration (untracked). Test dir contains only an interrupted
  `RuleBasedReplyInterpreterTest.java.tmp.*` partial write — no real tests yet. design/ untouched.
- [baseline] Restored `RuleBasedReplyInterpreterTest.java` from the interrupted .tmp (content was complete).
  `mvn test` → 271 run, 0 fail, 0 err (incl. interpreter test). Docker daemon NOT running →
  Testcontainers `*IT` (failsafe) cannot run on this machine this session.
- [fix] Simulator token gate moved to `LeadConversationSimulatorGate` (HandlerInterceptor) — previously the
  check ran inside the controller *after* body parsing, so a tokenless caller sending malformed JSON got
  400 (revealing the endpoint) instead of 404. Controller re-checks via the gate (defence in depth).
- [tests] Added 12 test classes under backend/src/test/java/com/arooraa/leads/capture (service, reference
  generator, controller web slice, feature gate, engine EN/TA flows, outbound guard + script safety,
  interpreter w/ model, Ollama adapter vs fake HTTP server incl. timeout/circuit breaker/fallback model,
  conversation service incl. reference-hijack protection, simulator gate x3).
  Result: 130 capture tests, 0 failures.
- [frontend-v2] Already wired to POST /api/v1/lead-captures (adapter.ts) behind build flag
  NEXT_PUBLIC_LEAD_CAPTURE_ENABLED (default off). Contract matches backend DTO 1:1; consent text
  < 500 chars; nginx /api/leads/ already proxies the path. Results: vitest lead-capture+campaign
  33/33 pass; tsc clean; eslint 0 errors (41 pre-existing <img> warnings, unrelated); next build OK.
  Decision: flag left OFF — it must only be flipped after the backend is deployed (deploy is out of scope).
- [IT] Wrote backend LeadCaptureIT (Testcontainers Postgres: V11 migration, consent, idempotency,
  409, 429, full simulator conversation persisted). Attempting to start Docker Desktop to run it.

## Resume run — 2026-10-11 (IST)
- [14:30] Resumed from this report + uncommitted tree. Docker CLI: `failed to connect ... dockerDesktopLinuxEngine`.
  Docker Desktop launched from the agent shell, but its backend crashed:
  `initializing settings: getting default data folder: unable to get 'ProgramData'`. Cause: the agent
  shell's environment lacked `ProgramData`/`ALLUSERSPROFILE`. This explains why the previous run's
  Docker start attempt never came up.
- [14:34] `mvn test` → 341 run, 0 failures, 0 errors, 0 skipped (13 capture test classes).
- [14:35] Relaunched Docker Desktop with `ProgramData=C:\ProgramData` and `ALLUSERSPROFILE=C:\ProgramData` set.
  Engine 29.8.1 was ready in about 20 s.
- [14:36] First real run of `LeadCaptureIT` (Testcontainers postgres:16-alpine): 6 run, 1 error.
  `aStrangersMessageCreatesTheirOwnLeadWithChatConsent` failed with
  `ERROR: value too long for type character varying(20)`. `ConsentSource.CUSTOMER_INITIATED_CHAT` is
  23 chars, but `lead_captures.consent_source` was VARCHAR(20). In production, every chat-originated lead
  would have failed to save. Unit tests use mocks, so they could not catch this; only the IT did.
- [14:37] Fix: `consent_source` widened to VARCHAR(30) in V11 and `@Column(length = 30)` in LeadCapture.
  V11 was edited in place because it has never been committed, merged or deployed (it was untracked).
  Any *local* dev DB that already applied the old V11 will see a Flyway checksum mismatch: drop that
  local schema or run `flyway repair`. Also corrected the V11 `source` comment to WEBSITE | WHATSAPP | SIMULATOR.
  Checked every other enum-backed column against its longest value; all fit.
- [14:37–14:38] `mvn verify` (unit + all failsafe ITs, real Postgres via Testcontainers) → BUILD SUCCESS.
  Surefire: 341 run, 0 failures, 0 errors. Failsafe: 80 run, 0 failures, 0 errors:
  LeadCaptureIT 6/6, AdminIT 23/23, JobApplicationIT 13/13, ContactMessageIT 10/10, DemoRequestIT 5/5,
  ProjectEnquiryIT 11/11, NotificationOutboxIT 12/12.
- [14:39] Security/claims sweep of capture/: no phone numbers or message bodies in log statements; no
  hard-coded secrets (all via env with safe defaults); the simulator is off by default, needs a 24+ char
  token, compares it in constant time (MessageDigest.isEqual) and answers 404 before the body is parsed.
  Two Javadoc comments that implied an existing WhatsApp webhook were reworded to say it is future work.
  `mvn compile` clean.
- [14:39] frontend-v2 (no files changed this run): vitest lead-capture + campaign → 2 files, 33/33 pass.

## Status — what this branch does and does NOT do
- DOES: persist consented web-form leads (POST /api/v1/lead-captures) with idempotency, per-client
  rate limiting and opaque LC-XXXXXX references; run a scripted EN/TA follow-up conversation,
  persisted, drivable only through the token-gated local simulator; optional local Ollama classifier
  that only picks from a closed set and falls back to rules.
- DOES NOT: send or receive any real WhatsApp message. There is no WhatsApp webhook or Meta Cloud API
  integration. That needs Meta onboarding and credentials and is out of scope.
- frontend-v2 lead-capture flag `NEXT_PUBLIC_LEAD_CAPTURE_ENABLED` stays OFF until the backend is deployed.
  No deploy was done. main and production were not touched.
- Not committed: `design/` (untracked, deliberately left alone).
