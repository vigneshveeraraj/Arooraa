# Arooraa WhatsApp Cloud API transport — setup, flags, operations

Status: IMPLEMENTED (credential-independent), NOT_READY for production. All flags default OFF.
Code: `backend/src/main/java/com/arooraa/leads/capture/whatsapp/`, migration `V12__add_whatsapp_inbox_outbox.sql`.

## 1. How it works
1. Meta → `GET /api/v1/whatsapp/webhook` (subscription challenge) and `POST /api/v1/whatsapp/webhook` (events).
   Only this exact path is public and CSRF-exempt; it is never CORS-enabled. Off → 404.
2. POST: body read raw, at most 256 KiB (413 above), `X-Hub-Signature-256` verified **before** parsing or any write
   (401). Signed but malformed → 400 (no payload echoed). Only `object=whatsapp_business_account`, the configured WABA id
   and the configured `phone_number_id` are processed; anything else is acknowledged (200) without writes.
3. Supported inbound: `text`, interactive `button_reply` / `list_reply` titles, quick-reply `button` text (the existing
   numeric/text script understands all of them). Ignored (200, no conversation): media, location, reactions, stickers,
   unknown types, texts over 2000 characters. `contacts`/profile names are never read.
4. The webhook only inserts into `whatsapp_inbound_messages` (dedup on `(phone_number_id, wamid)`, `ON CONFLICT DO NOTHING`)
   and applies delivery statuses, in one transaction, then answers 200. No conversation/model/network work in the request.
5. Worker → `WhatsAppInboundProcessor`: per participant, oldest first, one transaction = conversation turn
   (`LeadConversationService`) + inbox `PROCESSED` + reply rows in `whatsapp_outbound_messages`. Failures retry
   (30 s, 2 m, 10 m, 30 m), then `DEAD` after 5 attempts. A `RETRY` row blocks newer messages of the same participant.
6. Worker → `WhatsAppOutboundDispatcher`: claims one row, enforces the 24 h window (anchored on Meta's message timestamp,
   capped by receipt time; never extended by replays), commits `SENDING`, then calls
   `POST https://graph.facebook.com/{api-version}/{phone-number-id}/messages` outside any transaction with
   `biz_opaque_callback_data` = the outbox row id. Outcomes: `ACCEPTED` (Meta id stored), `RETRY` (429/throttled; max 3 attempts,
   5 s → 5 min backoff, Retry-After capped), `FAILED` (auth/permission/other 4xx; sanitised code), `UNKNOWN`
   (timeout, reset, 5xx, unreadable 2xx, crash), `EXPIRED` (window closed). **UNKNOWN is never resent automatically.**
7. Status callbacks (`sent` < `delivered` < `read`; `failed` only from none/sent) update the matching row — matched by Meta id,
   or by our correlation id while no Meta id is stored (callback before send response), and only for the same account and
   recipient and an already-attempted row. A callback also turns `SENDING`/`UNKNOWN` into `ACCEPTED`. A delivery `failed`
   never triggers a resend.

## 2. Feature flags (all default false — keep false in production)
| Variable | Effect |
|---|---|
| `AROORAA_WHATSAPP_ENABLED` | Webhook GET/POST live; inbox processor bean exists. Requires app secret, verify token, phone number id, WABA id. |
| `AROORAA_WHATSAPP_OUTBOUND_ENABLED` | Real Cloud API gateway + dispatcher. Requires `ENABLED`, access token, explicit API version. |
| `AROORAA_WHATSAPP_WORKER_ENABLED` | Scheduled processing/dispatch (needs `ENABLED`). Off = rows accumulate safely. |

Startup fails (property name only, never a value) if a switch is on and its settings are invalid. With
`ENABLED=true, OUTBOUND_ENABLED=false` inbound messages are processed and replies are queued `PENDING` but never sent.

## 3. Non-secret Meta setup list (sandbox first)
1. Confirm the provider: this code targets **Meta's direct Cloud API**. If the connected business number is on a BSP
   (e.g. a reseller/on-premises provider), this transport does not apply — stop and re-plan.
2. Meta Business portfolio → WhatsApp Business Account: note the **WABA id** → `AROORAA_WHATSAPP_BUSINESS_ACCOUNT_ID`.
3. Meta developer app (Business type) with the WhatsApp product; WhatsApp → API Setup: note the **Phone number ID**
   → `AROORAA_WHATSAPP_PHONE_NUMBER_ID` (use the Meta test number for the sandbox).
4. The **Graph API version** shown in the app dashboard → `AROORAA_WHATSAPP_API_VERSION` (format `vNN.N`; no default on purpose).
5. Secrets (secrets manager only): App settings → Basic → **App secret** → `AROORAA_WHATSAPP_APP_SECRET`; a
   **system-user access token** with `whatsapp_business_messaging` → `AROORAA_WHATSAPP_ACCESS_TOKEN`; a freshly generated random
   **verify token** (≥ 24 chars, different from the app secret) → `AROORAA_WHATSAPP_VERIFY_TOKEN`.
6. WhatsApp → Configuration → Webhook: callback URL `https://<public-host>/<proxy-prefix>/api/v1/whatsapp/webhook`, the verify token
   above, and subscribe the **messages** field. The app must be subscribed to the WABA.
7. Add the sandbox recipient numbers allowed by Meta for the test number.

## 4. Secure local injection (sandbox only)
Never put values in `.env.example`, `application.yml`, docs, chat, tickets or shell history files. For one PowerShell session:
```powershell
# Compatible with Windows PowerShell 5.1. Input values are not shell-history commands.
function Set-SessionSecret([string]$name, [string]$label) {
    $secure = Read-Host $label -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        [Environment]::SetEnvironmentVariable($name,
            [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer), 'Process')
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        $secure.Dispose()
    }
}
Set-SessionSecret 'AROORAA_WHATSAPP_APP_SECRET' 'Meta app secret'
Set-SessionSecret 'AROORAA_WHATSAPP_VERIFY_TOKEN' 'Verify token (>=24 chars)'
Set-SessionSecret 'AROORAA_WHATSAPP_ACCESS_TOKEN' 'System user access token'
$env:AROORAA_WHATSAPP_PHONE_NUMBER_ID = '<numeric id>'; $env:AROORAA_WHATSAPP_BUSINESS_ACCOUNT_ID = '<numeric id>'
$env:AROORAA_WHATSAPP_API_VERSION = '<vNN.N from dashboard>'
$env:AROORAA_WHATSAPP_ENABLED = 'true'   # outbound/worker only for the supervised send step
```
Close the session afterwards. Rotate the access token and app secret if they were ever pasted anywhere else.
Logs carry ids, counts and codes only — never the token, phone numbers or message text.

## 5. Sandbox-only acceptance checklist (supervised; not production)
- [ ] `mvn test` and `mvn verify` (Testcontainers) green on the reviewed commit — see §8.
- [ ] Meta "Verify and save" succeeds; wrong token gives 403 in backend logs.
- [ ] A test-number message (English) creates one inbox row, then one conversation turn and one outbox row (worker on).
- [ ] A Tamil message renders correctly end to end.
- [ ] With `OUTBOUND_ENABLED=true`: reply arrives on the handset; row `ACCEPTED` with Meta id; `delivered`/`read` callbacks recorded.
- [ ] Meta "Test" webhook button / redelivery causes no duplicate turn or reply.
- [ ] A signed event for another WABA or phone-number ID produces no writes. Meta's test-number recipient restrictions are separate; this application does not implement an inbound recipient allow-list.
- [ ] Stop the app mid-send (or block egress) → row ends `UNKNOWN`, not resent.
- [ ] All flags back to false after the session; token rotated if shared.

## 6. Operator recovery (database, supervised — there is no public replay endpoint)
Inspect:
```sql
SELECT id, status, attempt_count, last_error_code, updated_at FROM whatsapp_inbound_messages  WHERE status IN ('RETRY','DEAD');
SELECT id, status, attempt_count, last_error_code, meta_message_id, delivery_status, updated_at
  FROM whatsapp_outbound_messages WHERE status IN ('UNKNOWN','FAILED','SENDING','EXPIRED');
```
- **Inbound DEAD**: fix the cause, then `UPDATE whatsapp_inbound_messages SET status='RETRY', attempt_count=0, next_attempt_at=now() WHERE id='<id>';`
  (it will be processed after any older pending messages of that participant).
- **Outbound UNKNOWN**: first wait for status callbacks (they promote it to `ACCEPTED`). Otherwise check WhatsApp Manager / the
  customer chat. Only if it is confirmed NOT delivered and still inside the 24 h window, with a second person's approval:
  `UPDATE whatsapp_outbound_messages SET status='RETRY', next_attempt_at=now(), lease_token=NULL WHERE id='<id>' AND status='UNKNOWN';`
  Otherwise leave it and let the team follow up by phone.
- **FAILED** (`AUTH_*`, `META_*`): fix credentials/permissions; do not bulk-requeue. **EXPIRED**: needs an approved template
  message (not implemented) or a phone call.
- Stale `SENDING` rows are moved to `UNKNOWN` automatically after the lease (≥ 2 min).

## 7. Known limitations / remaining release blockers
- Meta credentials, account ids and provider (direct Cloud API vs BSP) are unconfirmed; no live sandbox run yet.
- Public route not wired: Nginx must proxy the exact webhook path to the backend (and allow ≥ 256 KiB bodies);
  `docker-compose.prod.yml` intentionally does not pass `AROORAA_WHATSAPP_*` yet. Both need an approved deployment change.
- Template messages (outside the 24 h window), media, and agent hand-off notifications are out of scope.
- WhatsApp startup requires `arooraa.lead-assistant.model.provider=none`. This is enforced in configuration so no classifier network call can run inside the processor's transaction. The disabled WhatsApp feature preserves existing simulator model settings.
- Ordering is by Meta timestamp then arrival; a message delayed by Meta after newer ones were processed is handled late.
- A `DEAD` inbound row or an `UNKNOWN`/`FAILED` reply no longer blocks the participant's later messages (to avoid a stuck chat).
- `frontend-v2/docs/lead-capture.md` may still say no webhook exists — frontend docs were out of this task's scope.
- Independent code/security/QA review and owner approval are required before any production flag is turned on.

## 8. Supervisor commands (run from `backend/`; Docker required for ITs)
```
mvn -q -Dtest="MetaWebhookSignatureVerifierTest,WhatsAppDeliveryPolicyTest,MetaWebhookDecoderTest,CloudApiWhatsAppGatewayTest,WhatsAppWebhookWebTest,WhatsAppWebhookOffWebTest" test
mvn -q -Dit.test=WhatsAppIT -Dtest=NoSuchTest -Dsurefire.failIfNoSpecifiedTests=false verify
mvn verify
```


## 9. Verified continuation — 2026-10-12
- Owner confirmed the existing number is used in the WhatsApp Business phone app; Meta API onboarding is not verified. Start with a Meta test number. Do not delete, deregister or migrate the existing number as part of sandbox setup.
- Create or reuse an authorized Meta developer app with the WhatsApp use case/product. Note only non-secret App ID, WABA ID, Phone Number ID and the API version shown in the dashboard. Configure App Secret and access token through secure session input or an approved secrets manager; never paste them into chat.
- Official setup: https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- Reusing the current phone-app number requires a separately verified coexistence/migration route; it is not established merely by using the phone app. No number changes or provider spending are authorized by this code implementation.
- Supervisor reviewed the implementation and corrected the locally generated pure-policy draft, enforced rules-only transactional conversation processing, added config failure tests and signed English/Tamil completion coverage.
- The first full build in the original checkout failed at Spring Boot JAR renaming. Verification ran from an isolated source copy at D:\Test\arooraa-whatsapp-verify-20261012 so it did not require stopping or replacing a local application.
- Full `mvn -B verify`: BUILD SUCCESS; 394 unit tests, 96 PostgreSQL integration tests (including 10 WhatsApp ITs), zero failures/errors/skips. The gateway was mocked: these results do not prove real Meta delivery.
- Evidence logs: D:\AgentOps-Pocket\data\workforce\whatsapp-unit-tests.log and whatsapp-isolated-verify.log. Source code/settings used by verification match the repository source; documentation was updated afterward only.
- Release verdict remains NOT_READY. Remaining external steps: Meta app/test-number onboarding, secure credential injection, authorized public HTTPS sandbox callback setup, live send/receive and delivery-receipt verification, independent release acceptance and owner deployment approval.
- All production webhook/outbound/worker flags remain false by default. No real outbound WhatsApp message, production deployment, credential reset or paid API request was performed. Existing Claude subscription CLI and two bounded local Ollama tasks were used.

## 10. Meta sandbox progress and local callback preparation — 2026-10-12
Verified in the owner's Meta developer session:
- App: Arooraa Lead Sandbox; App ID 1362359049310995.
- Test Phone Number ID 1276820242191298; WABA ID 1074115012292548; API version v25.0.
- Owner added and verified a sandbox recipient and generated a temporary access token.
- Meta UI confirmed the hello_world test was sent; owner confirmed handset receipt.
- Owner sent "Hi" from the handset. Webhook callback/subscription fields are still empty, so this is not evidence of backend receipt.
- App remains unpublished with zero production numbers and one test number. Meta's configuration page warns that production webhooks require publication; publication is a separate release action.
- No app secret or access token was copied into chat, repository, or supervisor logs. No Arooraa live send/receive/receipt verification is complete.

Prepared (not started):
- ops/start-whatsapp-sandbox.ps1: local interactive masked secret entry; generated verify token copied only after owner's explicit COPY input.
- Fresh disposable PostgreSQL container on 127.0.0.1:5544, isolated backend on 127.0.0.1:8098, webhook-only proxy on 127.0.0.1:8099.
- Existing Arooraa/MESA applications and database containers are preserved. Existing inherited AROORAA/SPRING/JVM option overrides are cleared for the sandbox child and restored on exit.
- Initial worker and outbound flags are OFF, allowing callback validation and durable inbox checks before sending replies.
- Proxy allows only the exact /api/v1/whatsapp/webhook path and GET/POST. It bounds bodies, preserves raw signed bytes, strips credentials/cookies/forwarded headers, and hides backend error text.
- Proxy security integration test passed; PowerShell syntax and dependency/port preflight passed. Full launcher startup remains untested because it requires owner-entered secrets.
- Existing verified JAR: D:\Test\arooraa-whatsapp-verify-20261012\target\lead-service.jar.
- Proposed public connection: temporary Cloudflare Quick Tunnel to http://127.0.0.1:8099. cloudflared is not currently installed. Do not start a tunnel without owner's action-time approval for public exposure and test message routing through Cloudflare.
- Official tunnel docs: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/ (temporary hostname, development only, no uptime guarantee).
- Run preflight: powershell -NoProfile -File D:\Arooraa\ops\start-whatsapp-sandbox.ps1 -Preflight
- Interactive launch after approval: powershell -NoProfile -File D:\Arooraa\ops\start-whatsapp-sandbox.ps1
- Once ready and approved, install/use official cloudflared and target ONLY the proxy: cloudflared tunnel --url http://127.0.0.1:8099
- Then set the generated HTTPS hostname + /api/v1/whatsapp/webhook and the secure verify token in Meta; Verify and save; subscribe messages; verify a signed test event before enabling worker/outbound replies.
- Stop the interactive launcher to stop only its owned processes/container and clear its verify token if still in the clipboard. Its temporary sandbox test database is removed on shutdown.

Local dummy-credential smoke verification subsequently passed:
- Real isolated JAR startup + PostgreSQL migrations completed; health UP.
- Through proxy: valid GET challenge 200 with exact challenge body, wrong verify token 403, unsigned POST 401, /actuator/health denied with 404.
- No real Meta credentials or outbound request were used. Clipboard functions were replaced inside the smoke process; the real user clipboard was untouched.
- Cleanup succeeded, stopping only owned backend/proxy processes and removing the disposable database; mock verify token cleared.
- Harness/evidence: D:\Test\arooraa-whatsapp-sandbox-smoke.ps1; sandbox startup logs in D:\Test\arooraa-whatsapp-sandbox\.

## 11. Owner approved temporary sandbox tunnel — 2026-10-12 15:48 IST
- Owner explicitly approved "sandbox tunnel"; this does not authorize production publication or real-number migration.
- Installed official cloudflared 2026.10.0 in D:\AgentOps-Pocket\tools\cloudflared\cloudflared.exe; official GitHub release asset SHA256 verified: 86aee4017b26625cee8484c113558f48effa4cd47f7aa05fcf425604e5d2b23c.
- Opened the sandbox's interactive credential console. App Secret/access token remain owner-entered, masked local prompts.
- Added watch-whatsapp-sandbox-tunnel.ps1. It waits up to 30 minutes for the owned loopback Node webhook proxy; only then starts cloudflared to 127.0.0.1:8099. It records the public callback URL without credentials and stops its tunnel when the proxy stops.
- Watcher PowerShell syntax passed. At launch it reported WAITING_FOR_LOCAL_CREDENTIAL_SETUP; actual tunnel creation and live Meta callback remain pending.

## 12. Local credentials entered and approved tunnel reachable — 2026-10-12 16:26 IST
- Owner completed both masked local credential prompts and COPY for the generated verify token; local backend 8098 and proxy 8099 are ready.
- Corrected watcher log reading to FileShare.ReadWrite after the first live launch hit a Windows file-sharing lock. The failed watcher stopped its owned tunnel, leaving local sandbox processes intact.
- Restart succeeded and generated an HTTPS callback. Actual public probes: non-webhook /actuator/health returns 404; GET webhook without required challenge parameters returns 400; unsigned POST webhook returns 401.
- Filled the nonsecret callback URL in Meta's Configuration page. Owner still needs to paste the verify token from the laptop clipboard and Verify and save; messages subscription and live inbound/automated reply are unverified.
- Worker/outbound remain OFF. The tunnel is automatically stopped when its owned proxy stops.
