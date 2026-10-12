# Arooraa WhatsApp integration — remaining work and release gate

Project: PRJ-AROORAA-LEADS
Status: DEVELOPMENT_VERIFIED / LIVE_WHATSAPP_BLOCKED / PRODUCTION_NOT_READY
Date: 2026-10-12

## Completed in this continuation
- Added an isolated HMAC-SHA256 validator for the Meta X-Hub-Signature-256 header. It uses the raw webhook body and constant-time comparison.
- Added four focused unit tests covering success, body tampering, missing/invalid inputs, and mismatched/replayed signature across different payloads.
- Ran `mvn -q -Dtest=MetaWebhookSignatureVerifierTest test` successfully.
- No production changes, releases, worker concurrency changes, outbound WhatsApp calls, or cloud costs.

## Historical development plan (implemented and verified on 2026-10-12; live sandbox still pending)
1. Implement the webhook GET challenge endpoint using a separately configured, strong verify token.
2. Implement POST webhook parsing behind signature validation; reject before parsing or writing on any authentication failure.
3. Translate only supported inbound messages into the existing LeadConversationService InboundMessage(WHATSAPP, ...). Validate E.164 and Meta message IDs. Acknowledge only after safe durable acceptance.
4. Add deduplication and idempotency for Meta retries, including concurrent deliveries.
5. Use a durable outbound queue/outbox with delivery status handling, retry bounds and correlation IDs. Do not send inside database transactions.
6. Implement typed Meta Cloud API HTTP adapter with opt-in feature flag default OFF, environment-injected credentials, timeouts, bounded retry/backoff, error categorization, and safe logging.
7. Add negative security tests, signed fixture tests, duplicate/replay tests, language EN/TA tests and persistent database integration tests.
8. Independent code/security/QA sign-off and supervised end-to-end sandbox verification.

## External prerequisites (no secret values in repository or chat)
- Authorized Meta Business portfolio and WhatsApp Business Account.
- Meta app credentials and a phone number ID, provided to a secure secrets manager.
- Public HTTPS webhook URL and network configuration.
- Valid test recipients and permitted messaging templates/window policy.
- Written owner approval before production activation.

## Release controls
- Until integration tests and the live sandbox prove real deliveries, mark NOT_READY.
- Keep NEXT_PUBLIC_LEAD_CAPTURE_ENABLED and new live WhatsApp transport flags OFF in production.
- Require independent CTO/QA/security acceptance. The existing CTO AgentOps employee is registered but not validated for execution.
- Owner approval is still required for production.


## Owner-requested pause — 2026-10-11 23:14 IST
- Owner requested pause; resume only on the owner's next instruction (planned 2026-10-12). No automatic restart scheduled.
- Registered Ponbalan EMP-0011 implementation worker and controller were stopped; no other workers were stopped.
- Partial, untested files remain in backend/src/main/java/com/arooraa/leads/capture/whatsapp/: WhatsAppProperties.java, WhatsAppConfiguration.java, WhatsAppGateway.java. Review these before continuing; do not assume they compile or constitute completed integration.
- Base commit is ded7e81a34ee13af84ee23abaccd07a7658af1f7 on feature/tamil-growth-campaign. Existing untracked design/ is outside this task.
- Full implementation brief and worker transcript are preserved in D:\AgentOps-Pocket\data\workforce\lead-admin-task.txt and lead-admin-worker.jsonl; execution state is Stopped in lead-admin-execution.json.
- Owner confirmed a business WhatsApp number is connected. Direct Meta Cloud API versus provider, account/app IDs, secure credentials and sandbox callback setup still need verification.
- No tests, live WhatsApp calls, deployment, feature activation or git commit were performed for this partial change.
- Next: review partial files, resume restricted implementation, run supervisor review/tests, then verify secure Meta sandbox prerequisites. Production remains unapproved.

## Resumed implementation — 2026-10-12 (Ponbalan EMP-0011, owner-requested continuation)
Status: IMPLEMENTED_UNTESTED / LIVE_WHATSAPP_BLOCKED. Setup, flags, runbook and blockers: `ops/whatsapp-integration.md`.
- Reviewed and kept the three paused files; reused the supervisor-corrected `WhatsAppDeliveryPolicy` unchanged (window,
  retry delay, 3-attempt bound, delivery rank) and added boundary tests for exact 24 h, future/negative shift, null
  Retry-After, negative/zero/overflowing attempts and unbounded Retry-After.
- Added: decoder, webhook controller (GET challenge / POST raw signed body), JDBC inbox, inbound processor, Cloud API
  gateway, outbound dispatcher, scheduled worker, migration V12, exact-path security permit, config placeholders.
- Tests written, NOT executed by this worker (no shell available): `WhatsAppDeliveryPolicyTest`, `MetaWebhookDecoderTest`,
  `CloudApiWhatsAppGatewayTest`, `WhatsAppWebhookWebTest`, `WhatsAppWebhookOffWebTest`, `WhatsAppIT` (Testcontainers PostgreSQL,
  mock gateway only). Compilation is also unverified. The supervisor must run §8 of `ops/whatsapp-integration.md`.
- No credentials, live Meta calls, deployment, production flag change, git commit or paid API use.


## Supervisor verification — 2026-10-12
- Completed credential-independent webhook, decoder, durable inbox/outbox, conversation processing, Cloud API gateway, bounded delivery retry, status reconciliation and stale-send recovery.
- Corrected local Ollama draft defects; enforced model provider none while WhatsApp is enabled, with tests. Added complete English/Tamil signed-webhook conversation coverage.
- Isolated full `mvn -B verify`: 394 unit +96 PostgreSQL integration tests, zero failures/errors/skips; 10 WhatsApp IT cases included. Packaging succeeded in isolated copy. Initial original-checkout packaging attempt failed on JAR rename; no running application was stopped.
- Local KamalHaasan advisory review executed. Its three allegations were rejected after source inspection: claim() only selects PENDING/RETRY, complete() uses lease-guarded transitions and guarded() excludes callback-proven ACCEPTED, and terminalAttempt() stops after 3 send attempts with next_attempt_at enforcing retry delays. Executed ITs cover these paths. The advisory output is not an independent expert or release sign-off.
- User confirmed WhatsApp Business phone app only. Need Meta app/test-number onboarding, secure secrets, HTTPS sandbox callback, live delivery/receipt verification, then independent release acceptance. See ops/whatsapp-integration.md.
- Production flags remain off; no customer messages or production activation occurred. Current code is ready for supervised sandbox setup, not production.

## Meta sandbox send verified — 2026-10-12
Status: META_SANDBOX_SEND_VERIFIED / AROORAA_CALLBACK_PENDING / PRODUCTION_NOT_READY.
Owner's verified recipient received Meta hello_world. Owner subsequently sent Hi; callback URL is still unset, so no backend receipt/automatic response is claimed.
Nonsecret Meta IDs and secure isolated callback preparation are recorded in whatsapp-integration.md section 10. Proxy security checks and launcher preflight passed; full local secret-backed startup is pending.
Next: approve temporary Cloudflare exposure of the webhook-only proxy; enter credentials locally; validate callback and messages subscription; test backend English/Tamil conversations and delivery callbacks. Keep production and real-number migration unapproved.
