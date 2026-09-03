# Aura — production runbook (A8)

**Nothing in this document has been executed.** Aura is not deployed, not merged and not enabled
anywhere. This is written so that the day somebody does decide to expose it, the decisions have
already been made calmly and in order, rather than at the moment of switching something on.

Everything here assumes the owner has accepted the conversations Aura is having locally. That
acceptance is the gate, and it is not a technical one.

---

## 1. The switches, and what each one actually does

Every one of these defaults to the safe value. There is no combination that turns Aura on by
accident, and each is independent of the others.

| Variable | Default | What turning it on does |
|---|---|---|
| `AURA_CHAT_ENABLED` | `false` | Registers the chat controllers. **While this is false, `/api/v1/aura/**` returns 404** — the routes do not exist, rather than existing and refusing. This is the master switch. |
| `AURA_CHAT_PROVIDER_ENABLED` | `false` | Lets Aura call a model. Off, every answer is the "I can't reach my thinking just now" fallback — the conversation works, the answers are useless. |
| `AURA_VOICE_ENABLED` | `false` | Registers the voice controller. Off, `/voice/**` is 404. |
| `AURA_VOICE_TRANSCRIPTION_ENABLED` | `false` | Speech in. Off, the microphone never appears — the browser asks `/voice/capabilities` first. |
| `AURA_VOICE_SYNTHESIS_ENABLED` | `false` | Speech out. Independent of the above: listening without speaking is a valid configuration. |
| `AURA_DISCOVERY_HANDOFF_ENABLED` | `false` | Lets a project brief become a real Start Project enquiry. Off, a visitor can still have the whole discussion and read the brief; only the last step is unavailable, and Aura says so. |
| `AURA_DISCOVERY_START_PROJECT_BASE_URL` | *(blank)* | Where the enquiry goes. Blank keeps the handoff off even if the switch above is on. |
| `AURA_INSIGHTS_ENABLED` | `true` | Recording. On by default: it writes rows containing no prompts, no answers and nothing identifying anybody. |
| `AURA_INSIGHTS_API_ENABLED` | `false` | Reading. Separate decision from collecting. |
| `AURA_INSIGHTS_TOKEN` | *(blank)* | Required by the insights endpoint. Blank means 404 for everyone, even with the API enabled. |
| `AURA_PROTECTION_ENABLED` | `true` | Rate limiting. **Leave it on.** |
| `AURA_BUDGET_ENABLED` | `true` | The daily ceiling on provider calls. **Leave it on.** |
| `AURA_RETENTION_ENABLED` | `true` | Deleting old conversations. **Leave it on.** |
| `AURA_BOOTSTRAP_PUBLIC_KNOWLEDGE` | `false` | Loads the approved corpus. A one-shot operator action, not something a running server should do. |

And one on the frontend, which is a **build-time** variable rather than a runtime one:

| Variable | Default | What it does |
|---|---|---|
| `NEXT_PUBLIC_AURA_ENABLED` | off in a production build, on in `next dev` | Whether the launcher is mounted on the public site. Off, there is no launcher in the HTML, nothing can be opened and no request reaches aura-service. It does **not** strip the widget's code from the bundle — measured, not assumed; the chunk is still in `out/`, referenced by no page. A production build has to be told to include Aura, which is the right way round for something not yet approved for the public. |

`OPENAI_API_KEY` is read from the environment and never appears in configuration, in a properties
object, in a log line or on the health surface. It is not in this repository and must not be.

---

## 2. Turning Aura on, in order

Do these one at a time and stop at the first thing that is not what this says it should be.

**Before anything.** Confirm the database is reachable, migrations are current
(`V1`…`V7`), and the corpus is loaded. `/actuator/health` from the host must be `UP`.

**Step 1 — the service, with nothing exposed.** Deploy it. Leave every switch at its default.
Nothing is reachable; this only proves it starts, connects and migrates.

**Step 2 — Nginx.** Apply `ops/nginx/aura.conf.template` by hand into the existing server block.
It is a template and not an include; read it, because it contains two changes to *existing*
directives that Aura does not work without. Then:

```
nginx -t && systemctl reload nginx
curl -o /dev/null -w '%{http_code}\n' https://arooraa.com/actuator/health   # must be 404
```

**Step 3 — chat, without a provider.** `AURA_CHAT_ENABLED=true`, provider still off. Open the site,
ask Aura something. Every answer will be the fallback sentence. This proves routing, CORS,
conversation creation and the rate limiter, and costs nothing.

**Step 4 — the provider.** `AURA_CHAT_PROVIDER_ENABLED=true`. Ask three things: something about
AROORAA, something confidential ("what database does MESA use internally?"), and something
off-topic. Confirm the second is declined warmly and the third is redirected. **If the
confidentiality boundary does not hold, turn `AURA_CHAT_ENABLED` back to false and stop.**

**Step 5 — watch it for a day** before turning anything else on. Read
`aura.conversation.turn.latency`, the guardrail counters, and the knowledge gaps.

**Step 6 — voice, if wanted.** `AURA_VOICE_ENABLED` plus the direction switches. The
Permissions-Policy change in step 2 must already be live or the microphone will be refused by the
browser and it will look like our bug.

**Step 7 — the handoff, if wanted.** `AURA_DISCOVERY_HANDOFF_ENABLED=true` and the base URL. Then
do one end-to-end: have a project conversation, read the brief, consent, and **check the enquiry
arrived in the existing Start Project workflow with a reference**, exactly as one from the website
form does.

---

## 3. Turning it off

In an incident, prefer the smallest switch that stops the problem.

| Symptom | Turn off | What the visitor sees |
|---|---|---|
| Answers are wrong, unsafe, or say something they should not | `AURA_CHAT_PROVIDER_ENABLED=false` | Aura still opens and responds, with the "can't reach my thinking" sentence. |
| Aura must be gone from the site entirely | `AURA_CHAT_ENABLED=false` — then redeploy the frontend without `NEXT_PUBLIC_AURA_ENABLED` | The first takes effect immediately and makes every call 404, so the panel shows its unavailable state; the launcher is still on the page until the frontend is rebuilt. Do the backend switch first: it is the one that stops Aura saying anything. |
| Provider spend is climbing | Lower `AURA_BUDGET_CHAT_CALLS_PER_DAY` | Once the day's ceiling is reached, the fallback sentence. |
| A caller is hammering the API | Lower the relevant `AURA_PROTECTION_*_PER_MINUTE` | 429 and "give me a moment and try again". |
| Enquiries are arriving wrong | `AURA_DISCOVERY_HANDOFF_ENABLED=false` | The discussion and the brief still work; Aura says it cannot send it just now. |
| Voice is misbehaving | `AURA_VOICE_ENABLED=false` | The microphone disappears; typing is unaffected. |

Every one of these takes effect on a restart of aura-service alone, and none needs an Nginx change
or a database change. **None of them loses a conversation.** The only one that also wants a
frontend deploy is removing the launcher, and that is the second half of the row above rather than
the part that stops Aura talking.

---

## 4. Things that will surprise somebody at 2am

- **The daily budget lives in memory.** It resets when the service restarts, and it is per process.
  Restarting to clear a problem also clears the day's spend. If Aura is ever run as more than one
  instance, each gets its own full ceiling and the real ceiling is the sum — that is a deliberate
  trade for a single-instance deployment, and it must be revisited before scaling out.
- **The rate limiter is also in memory,** with the same consequences. A restart gives everybody a
  fresh bucket.
- **`trust-proxy-headers` is false by default and must be true behind Cloudflare**, or every visitor
  in the world shares one bucket. It must be false without a proxy in front, or every caller picks
  their own identity. Both mistakes are silent. See the template for the header to use.
- **Retention deletes conversations after 90 days, permanently.** There is no soft delete and no
  archive. The counted events survive with their conversation link severed.
- **A switched-off surface returns 404, not 403.** That is deliberate. A monitor that alerts on 404
  from `/api/v1/aura/**` will alert continuously while Aura is off.
- **The insights endpoint returns 404 for a wrong token,** not 401. If it "does not exist", check
  the token before assuming the deployment is broken.

---

## 5. What to watch

Metrics (Micrometer, on the actuator):

| Metric | Why |
|---|---|
| `aura.conversation.turn.latency` | The visitor's experience, end to end. |
| `aura.protection.budget.spent{kind}` | How close today is to its ceiling. |
| `aura.protection.budget.refused{kind}` | Non-zero means a ceiling was reached — the day was extraordinary, or the ceiling is wrong. |
| `aura.protection.rate_limited{surface}` | A spike on one surface is abuse; a spread is a limit set too low. |
| `aura.voice.provider.failures{stage,kind}` | `transient` clears itself; `permanent` does not. |

The service also logs a single warning the first time each budget is exhausted in a day — once, not
once per request.

Knowledge gaps (`/api/v1/aura/insights`, or the table) are the one thing worth reading rather than
alerting on: they are the questions people asked about AROORAA that our own knowledge could not
answer. Nothing acts on them automatically. Somebody writes the answer, or nobody does.

---

## 6. Backups

Aura's database is separate from lead-service's and is **not** covered by `ops/backup-db.sh`. Adding
it is a prerequisite for treating any of this as production, and has not been done. What would be
lost without it: the corpus (rebuildable from `knowledge-seed` via the bootstrap), conversations
(inside the 90-day window), and the knowledge gaps — which are the only thing here that is neither
rebuildable nor time-limited, and the only real argument for the backup.
