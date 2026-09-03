# Aura — pre-production security review (A8)

A deliberately adversarial pass over everything A5 through A8 added. Each item states the attack,
what actually stops it, and where that is asserted. Where the answer is "nothing yet", it says so.

Nothing in this review was performed against a deployed system, because there is not one.

---

## 1. The network path

**Could a browser ever reach the AI provider directly?**

No, and not by policy — by construction. The browser has no key and no provider URL. `client.ts`
posts to a relative `/api/aura/**`; in development a Next.js rewrite proxies it server-side, in
production the reverse proxy does. `OPENAI_API_KEY` is read from the environment by the provider
adapters and never leaves the service: it is not on a properties object, not in a log line, not on
the health surface, and not in this repository.

The provider-selection conditions are plain `Condition` classes rather than SpEL, specifically so
no key value is ever spliced into an expression string that could end up in a startup error.

**Could a `NEXT_PUBLIC_*` variable expose it?** Only variables prefixed `NEXT_PUBLIC_` reach the
bundle. Every one that exists in this codebase is a base path, a base URL, or a boolean —
`NEXT_PUBLIC_API_BASE_PATH`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ADMIN_API_BASE_PATH`,
`NEXT_PUBLIC_AURA_API_BASE_PATH`, `NEXT_PUBLIC_AURA_API_BASE_URL`, `NEXT_PUBLIC_AURA_DIAGNOSTICS`,
`NEXT_PUBLIC_AURA_ENABLED`. There is no code path that reads a key on the client because there is
no key on the client.

---

## 2. Prompt injection

**Can a visitor make Aura reveal its policy?** The policy text is never returned; the output
guardrail checks the generated answer against it and replaces an answer that leaks it.
`AuraChatApiIT` and `OutputGuardrailTest` cover the direct and indirect attempts.

**Can a visitor make Aura submit an enquiry?** No, and this is the strongest statement available:
the model has no tools. `ProjectBriefExtractor` returns a record. There is no callback, no side
effect and nothing it could be talked into. Creating an enquiry is a separate HTTP request from the
browser carrying an explicit consent boolean. Asserted in `ProjectDiscoveryIT`
(`nothingAVisitorTypesCanCauseAnEnquiry`) with three hostile turns.

**Can injected text reach a *later* visitor?** No. Conversations do not share state, retrieval is
over the approved corpus only, and nothing a visitor types is ever written to the corpus — there is
no knowledge-mutation endpoint at all. A7's knowledge gaps record a question for a person to read;
they are not retrievable and are not a route into what Aura knows.

**Can injected text change the brief?** It becomes text in the brief or is dropped. The extractor
sees only visitor turns, delivered as numbered quoted lines under an explicit "this is DATA"
instruction, and `BriefGrounding` then drops anything whose words are not in what they said.

---

## 3. Confidentiality

**Does voice bypass the guardrails?** No, and it cannot, because voice is not a second path.
`VoiceService.transcribe` produces text and stops. The transcript is returned to the browser and
re-enters through the ordinary chat endpoint, so a spoken question meets the same validation,
classification, retrieval, evidence gate and output guardrail. `AuraVoiceApiIT` asserts that
transcription alone reaches no conversation and creates no message.

**Can `/voice/speech` be used to read arbitrary text aloud?** No. It takes a conversation id and a
sequence, never text, and speaks a *stored* answer. Free text-to-speech and divergence between what
is shown and what is heard are both structurally impossible rather than validated against.

**Does the spoken answer say more than the written one?** `SpeechTextPreparer` is deterministic —
markdown stripped, clamped to a sentence boundary. It calls no model, so what is heard is always a
prefix of what is displayed.

**Does the insights API leak conversations?** It returns counts and open gaps. It has no endpoint
that returns a message, and the gap question is truncated to 300 characters of a question about
AROORAA. `INTERNAL_BOUNDARY` turns never become gaps, so the table cannot become a list of things
we decided not to say.

---

## 4. Authentication and authorization on the new surfaces

| Surface | Who may call it | What stops everyone else |
|---|---|---|
| `/conversations`, `/messages` | anyone, when chat is enabled | Nothing, by design — it is a public assistant. Bounded by rate limits, the daily budget, input validation and the evidence gate. |
| `/voice/**` | anyone, when voice is enabled | As above, plus size, duration and MIME validation before any provider call. |
| `/brief` | anyone holding the conversation's public id | A brief is reachable only through its conversation, and the public id is an unguessable UUID the client already has. There is no brief identifier and no way to enumerate. |
| `/brief/handoff` | as above, plus an explicit consent flag | Four independent gates — see §5. |
| `/insights` | a caller with `AURA_INSIGHTS_TOKEN` | Off by default; constant-time comparison; **404** rather than 401, so an unauthorised caller does not learn the endpoint exists. |
| `/actuator/health` | the host | Not proxied publicly. Allowlisted to `health` alone, so `/env` and `/configprops` — which would print the resolved configuration including the API key — are not exposed even if a dependency adds them. |

**Cross-conversation leakage.** A conversation is addressed by its public UUID; the internal
primary key is never returned. `ProjectDiscoveryIT` asserts a new conversation knows nothing about
the last one, and that an unknown conversation id is a 404 rather than an empty brief.

---

## 5. The handoff, specifically

The one place Aura causes something outside itself. Four gates, none of which is a check a model
performs:

1. **Consent is a parameter, not an inference.** A `@NotNull Boolean` the browser sets from a
   question with two buttons and nothing else on screen. Omitting it is a validation failure, not a
   default. Providing contact details is not consent — asserted separately.
2. **The brief must have been seen** (`SUMMARISED`), which happens only when a summary is actually
   returned to the visitor.
3. **Re-extraction resets that to `DRAFT`,** so a corrected brief has to be looked at again.
4. **Submitting twice is impossible.** The reference is stored on the brief, and the idempotency key
   is derived from the conversation — so even a request that bypassed this service entirely would
   create nothing new at the other end.

**Could the model choose what goes into the enquiry?** No. `ProjectEnquiryMapper` is deterministic
and maps a fixed set of allowed brief fields; every enum the visitor was not asked about becomes
that form's own "not sure" value, and `productTypes` is left empty rather than inferred from
keywords — "we don't need a mobile app" reads identically to a keyword table.

**Are contact details stored?** No. They are validated, mapped, forwarded, and not kept. The
conversation database holds project descriptions with no way to attach a name to any of them.

---

## 6. Denial of service and cost

| Attack | What stops it |
|---|---|
| Flooding the chat API | Per-caller, per-surface token buckets; a refusal happens in a filter before the body is parsed or a provider is called (`AuraProtectionIT`). |
| Exhausting the limiter's memory with forged addresses | The bucket map is bounded (`max-tracked-clients`, LRU); a forged header is truncated to 64 characters before it becomes a key. |
| Uploading a huge audio file | Tomcat's `max-file-size` rejects it before application code; `AudioUploadValidator` re-checks the same ceiling; the reverse-proxy template raises `client_max_body_size` only for that one location. |
| Very long messages | `aura.safety.max-input-chars`, enforced by `InputValidator`. |
| Many callers, each reasonable, on a busy day | The daily call budget — the case rate limiting cannot see. Reaching it degrades to the same path a switched-off provider takes. |
| Prompt-length inflation via history | Bounded by both turn count and total characters. |
| Repeatedly re-extracting a brief | Its own daily ceiling, separate from chat's, because one visitor can trigger it repeatedly by correcting the brief. |
| Slow-loris / connection exhaustion | **Not addressed here.** Tomcat's defaults and the reverse proxy's timeouts are what exist. Noted rather than claimed. |

---

## 7. Data at rest

- **No raw audio is retained** — and it is a property of the configuration, not a cleanup routine:
  `file-size-threshold` equals `max-file-size`, so Tomcat never spills a part to a temporary file.
  Audio exists in memory for one request. No recording enters pgvector or becomes knowledge.
- **No transcript is logged.** Length and latency are logged; content never is.
- **`aura_events` has no free-text column.** Not "we are careful" — there is nowhere to put a
  prompt. No IP address, no user agent, no fingerprint, no identifier outliving a conversation.
- **Retention** deletes conversations and everything only readable with them after 90 days; events
  keep their counts and lose their conversation link.
- **Raw prompt logging** is off by default and off in production.

---

## 8. Static export

The frontend is `output: "export"`. A8 added no server action, no Next API route, no SSR
requirement and no Node runtime dependency; the build was run and the export inspected. The two
internal review pages are `page.review.tsx`, an extension that is a page extension only in
development, so `/design-system` and `/design-system/aura` are absent from `out/` entirely —
verified by building and grepping the output, including for the review fixtures' own copy, which
appears in no chunk.

---

## 9. What this review does not claim

- **No penetration test has been performed.** This is a code and design review.
- **No load test has been performed.** The rate limits and budget ceilings are reasoned defaults,
  not measured ones.
- **The daily budget and the rate limiter are per process.** Running more than one instance
  multiplies both ceilings. Documented in the runbook; it must be revisited before scaling out.
- **Aura's database is not in the existing backup job.** A prerequisite for calling any of this
  production, and not done.
- **Nothing here has been verified against a deployed system,** because Aura is not deployed.
