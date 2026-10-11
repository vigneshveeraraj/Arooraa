# Arooraa WhatsApp integration — remaining work and release gate

Project: PRJ-AROORAA-LEADS
Status: DEVELOPMENT_PARTIAL / LIVE_WHATSAPP_BLOCKED
Date: 2026-10-11

## Completed in this continuation
- Added an isolated HMAC-SHA256 validator for the Meta X-Hub-Signature-256 header. It uses the raw webhook body and constant-time comparison.
- Added four focused unit tests covering success, body tampering, missing/invalid inputs, and mismatched/replayed signature across different payloads.
- Ran `mvn -q -Dtest=MetaWebhookSignatureVerifierTest test` successfully.
- No production changes, releases, worker concurrency changes, outbound WhatsApp calls, or cloud costs.

## Next development tasks (credential-independent)
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
