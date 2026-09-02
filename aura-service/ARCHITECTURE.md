# Aura service architecture (A0/A1 foundation → A2 retrieval → A2.1/A2.2 calibration → A3 conversation)

## Why a separate service, not a module inside lead-service

`arooraa-lead-service` stays responsible for project enquiries, Careers, Contact and their
notifications — nothing about Aura's conversation, retrieval or provider surface touches that
service. Aura is deliberately a fully independent Spring Boot application (own `pom.xml`, own
`Dockerfile`, own database) living in this sibling directory, not a package added to
`backend/`. Reasons:

- `lead-service`'s own boundary is already "independent from other AROORAA backend services"
  (see its `pom.xml` description) — adding Aura there would violate that on day one.
- Aura's persistence needs (pgvector, versioned knowledge documents, embeddings) are unrelated
  to lead-service's relational lead/notification data — a shared schema would couple two
  systems that should evolve independently.
- A production incident, deploy, or scaling decision for one must never require touching the
  other.

## What exists in A0/A1

- **Service skeleton**: `AuraServiceApplication`, `application.yml` with production-safe
  defaults (all AI providers disabled unless explicitly configured), health endpoint only.
- **Domain model**: `AuraDocument` → `AuraDocumentVersion` (the actual unit of approval/status/
  retrieval-eligibility) → `AuraChunk` → `AuraEmbedding` (separate table — see its Javadoc for
  why), plus `AuraIngestionJob` tracking a chunk+embed run.
- **pgvector**: Flyway `V1` installs the `vector` extension (trusted since pgvector 0.5.0, no
  superuser step needed) and an `hnsw` index over `aura_embeddings.embedding vector(1536)`. A
  small custom Hibernate `UserType` (`VectorType`) maps it to a plain Java `float[]`.
  `pgvector/pgvector:pg16` is the Postgres image (local dev compose and Testcontainers ITs).
- **Provider abstractions**: `ChatGenerationProvider`, `EmbeddingProvider`, `RerankingProvider` —
  business code depends only on these interfaces. Only the production-safe *disabled* default
  implementations ship in `src/main`; a real provider adapter is a later milestone's
  `@Configuration`, added without touching these interfaces or their consumers. A deterministic
  test-only stub (`StubEmbeddingProvider`) lives in `src/test` specifically so it can never be
  shipped or accidentally enabled in production.
- **Retrieval boundary enforced at the query layer**: `AuraDocumentVersionRepository`/
  `AuraChunkRepository` each expose a `findAllRetrievable()` query requiring
  `active = true AND visibility = PUBLIC AND status = INDEXED` — not only a prompting rule.
- **Ingestion pipeline (minimal)**: `ChunkingService` (simple paragraph packing) +
  `IngestionService` (chunk → embed → persist → mark version `INDEXED`), enough to prove the
  pgvector persistence path end to end. No HTTP surface, no scheduling, no re-indexing workflow.

## What A2 added (knowledge ingestion + hybrid retrieval)

- **Import → approval → ingestion → activation pipeline**: `KnowledgeDocumentParser` (hand-written
  frontmatter parser, rejects malformed sources), `KnowledgeImportService` (checksum-idempotent —
  unchanged source re-import is a no-op; changed content becomes a new version, never an in-place
  edit), `KnowledgeApprovalService` (the human-in-the-loop gate; import never auto-approves),
  `IngestionService` (now guards `APPROVED`-only, idempotent for already-`INDEXED` versions,
  classifies provider failures transient-vs-permanent), `KnowledgeActivationService` (publishes an
  `INDEXED` version as current, deactivating its predecessor).
- **Heading-aware deterministic chunking**: `ChunkingService` splits at markdown headings, packs
  paragraphs to a configurable target size with configurable overlap (never across a section
  boundary), hard-splits only a single oversized paragraph as last resort, and fingerprints every
  chunk (SHA-256) with best-effort source offsets.
- **One real provider adapter**: `OpenAiEmbeddingProvider` behind the unchanged
  `EmbeddingProvider` interface — config-selected (`aura.provider.embedding.provider=openai` +
  `OPENAI_API_KEY`), bounded retry with transient/permanent error classification, no OpenAI type
  visible outside `provider.openai`. Misconfiguration (enabled but no key) falls back to the
  disabled provider with a warning; the app always starts.
- **Hybrid retrieval**: `VectorSearchRepository` (pgvector cosine/HNSW) + `LexicalSearchRepository`
  (Postgres full-text over chunk text/heading + document title/product/service, GIN-indexed) fused
  by Reciprocal Rank Fusion (`RrfFusion`, k=60 — deterministic, no tuned weights), orchestrated by
  `HybridRetrievalService`, which degrades to lexical-only when no embedding provider is enabled.
- **Evidence gate (superseded by A2.1 — see below)**: originally classified on a normalized RRF
  score.
- **Common-platform extension points**: `AuraDocument.knowledgeSpace` (default `AROORAA_PUBLIC`) +
  `AssistantProfile`/`Channel`/`AccessPolicy` (`PublicWebsiteAccessPolicy`, fail-closed). Both
  search repositories enforce `active + PUBLIC + INDEXED + authorized knowledge space` in SQL.

## What A2.1 fixed (evidence-gate hardening + real-provider calibration)

- **The A2 defect**: RRF score is a function of rank alone, so the best available chunk is rank 1
  whether it is excellent or irrelevant — on a small corpus, "what database does MESA use
  internally?" scored a perfect normalized RRF score and read as STRONG_EVIDENCE despite no such
  fact existing anywhere in the corpus. Frozen rule going forward: **RRF orders results; it must
  never determine confidence.**
- **Absolute-relevance evidence gate**: `EvidenceGateService` now classifies from
  `RelevanceSignals` — raw cosine similarity of the top chunk, `QueryTermCoverage` (an explainable,
  stemming-free fraction of the query's meaningful words present in the evidence text), and
  cross-signal agreement — never from RRF rank or score. Thresholds
  (`aura.retrieval.evidence.*-vector-similarity` / `*-query-term-coverage`) are measured and
  configurable, not intuited; see the A2.1 report for the calibration data.
- **Embedding generations**: `aura_embeddings` now allows one vector per `(chunk, generation)`
  (Flyway `V3`, additive), so a real-provider re-embedding run coexists with the prior stub
  cohort instead of overwriting it. `aura.provider.embedding.generation` selects which cohort
  ingestion writes and retrieval searches; `IngestionService.reembed` re-embeds an already-INDEXED
  version's existing chunks at the current generation without re-chunking.
- **Real embedding calibration**: `EmbeddingCalibrationIT` runs the same evaluation sets against
  the real `OpenAiEmbeddingProvider`, gated on `OPENAI_API_KEY` actually being present
  (`@EnabledIfEnvironmentVariable`) so it never runs, and never blocks, a secretless build.
- **Retrieval-relevant metadata versioning fix**: A2's import fingerprint hashed the raw source
  file, so a visibility or product-status change wasn't guaranteed to create a new version, and
  `AuraDocument`'s own title/product/service could silently drift from the source. `KnowledgeImportService`
  now fingerprints (`DocumentFingerprint`) an explicit, field-labelled projection of every
  retrieval-relevant field plus the body, and refreshes the document's editorial metadata
  (`AuraDocument.updateEditorialMetadata`) on every import.
- **Policy vs. public knowledge**: Aura's own policy documents (`90`–`95`) now declare
  `knowledge_space: AURA_POLICY` in addition to `visibility: INTERNAL` — two independent controls,
  so a mislabelled visibility alone still can't make policy content ordinary visitor-retrievable
  RAG evidence. `KnowledgeSpaces` (knowledge domain) is the single canonical definition;
  `retrieval.context.KnowledgeSpace` re-exports it rather than keeping a second copy in sync.
- **Adversarial and evaluation fixtures**: `EvaluationSets` centralizes the positive/negative/
  internal-boundary/multilingual/adversarial-token query sets so the secretless acceptance run and
  the real-provider calibration run measure identically; `AdversarialRetrievalIT` proves the three
  synthetic tokens are excluded at the lexical and vector layers independently, not only through
  fusion.

## What A2.2 fixed (evidence gate calibrated on real measurements)

- **The A2.1 defect**: the gate treated semantic similarity and lexical coverage as two independent
  "any signal" votes, so coincidental word overlap could carry a semantically irrelevant result to
  WEAK_EVIDENCE. Measured with the real provider: "What is today's weather?" scored similarity
  0.275 against a passage containing "today" (coverage 0.5) and read as WEAK. Frozen rule going
  forward, on top of A2.1's: **semantic similarity is the primary relevance signal; lexical
  coverage corroborates a result similarity already supports, and can never rescue one below the
  semantic floor.**
- **Calibrated thresholds**: measured over the approved corpus with `text-embedding-3-small`
  (generation 2) — answerable questions score 0.583–0.740, unrelated questions 0.042–0.275, an
  empty gap between. `strong-vector-similarity` = 0.58 and `weak-vector-similarity` = 0.30 sit at
  the edges of that gap rather than its middle, because the errors are asymmetric: a false STRONG
  invents an AROORAA fact, a false NO_EVIDENCE only declines to answer.
- **A confident semantic match stands alone**: crossing `strong-vector-similarity` is now
  sufficient for STRONG without lexical corroboration. This is what lets Tamil/Tanglish queries be
  answered confidently — they retrieve the right document (e.g. "AROORAA enna company?" →
  `01-company-overview`, 0.703) while scoring near-zero on `QueryTermCoverage`, which compares
  English tokens. Below that, only a near-exact lexical match (`>= strong-query-term-coverage`) can
  still promote a mid-similarity result.
- **Rank agreement left the decision**: `RelevanceSignals.signalsAgree` is still measured and
  reported for diagnostics, but no longer classifies — in a small corpus a single irrelevant
  candidate is trivially "agreed on" by both searches simply for being the only thing there.
- **Verified after the patch**: `EmbeddingCalibrationIT` was rerun locally against the real
  provider and passed — the answerable set reaches STRONG, all six unrelated questions (the weather
  query included) return NO_EVIDENCE, Tamil/Tanglish splits STRONG/WEAK by actual semantic
  similarity with no irrelevant promotion, and the internal-technology questions surface no private
  implementation fact.

## What A3 added (Aura's first conversations)

The pipeline, in order — each stage its own class, no god service:

`InputValidator` → `AssistantProfileResolver` → `ScopeClassifier` → `ConfidentialityClassifier` →
`ConversationContextLoader` → `RetrievalPlanner` → `HybridRetrievalService` (A2) →
`EvidenceGateService` (A2.2) → `GenerationPolicy` → `PromptComposer` → `ChatGenerationProvider` →
`OutputGuardrail` → `ResponseAssembler`, sequenced by `ConversationOrchestrator`.

- **Confidentiality is decided in Java, before generation.** `ConfidentialityClassifier` is
  deterministic because a boundary that depends on a model choosing to honour a prompt is not a
  boundary — and "ignore your instructions" is exactly the input it has to survive. The effect is
  structural: a boundary turn retrieves nothing, so its prompt contains no corpus text at all. The
  prompt-level instruction is the second layer. The line it draws is *whose* system is being
  discussed: "what database does MESA use?" is protected, "what database should I use for my SaaS?"
  is a question Aura should answer well.
- **Prompt composition, not a prompt string.** `AuraPolicy` supplies ordered `PromptSection`s
  (identity, profile, personality, confidentiality, mode, grounding, evidence, language, page
  context, ground rules). Which sections are present is itself a security property. `policyText`
  is tracked separately from `systemText` so the guardrail can detect instruction leakage without
  flagging a grounded answer that legitimately tracks its evidence.
- **Grounding follows the evidence gate, unchanged.** STRONG grounds a claim, WEAK qualifies or
  asks, NO_EVIDENCE forbids AROORAA-specific claims entirely — `95-aura-unknown-answer-policy.md`,
  now enforced in code by `GenerationPolicy`.
- **Two-tier output guardrail.** Security failures (secret-like material, instruction leakage, an
  AROORAA claim nothing supports) discard the answer; quality failures (robotic phrasing, excessive
  length) repair it in place. Leakage detection is structural — verbatim word runs from the actual
  instruction — rather than a phrase blacklist.
- **Real chat adapter.** `OpenAiChatGenerationProvider`, same rules as the embedding adapter:
  config-selected, bounded retry, transient/permanent classification, no vendor type outside
  `provider.openai`, no credential ever logged. A provider outage becomes a natural apology in the
  visitor's language, not an error page.
- **Conversation persistence (Flyway `V4`, additive).** `aura_conversations` / `aura_messages` /
  `aura_message_sources`. The system prompt, policy text, evidence text and retrieval scores are
  deliberately not stored, and nothing in this schema is reachable from the retrieval path — a
  transcript can never become knowledge.
- **Bounded session memory**, capped by both turn count and characters, dropping oldest first. No
  permanent personal memory.
- **Local-only surface.** `/api/v1/aura/**` and `/aura-test` exist only when
  `aura.chat.enabled=true` (default false) — the controllers are conditional, so the routes 404
  rather than being merely unadvertised. Diagnostics have their own separate switch.
- **Operator corpus bootstrap (A3.1).** `PublicKnowledgeBootstrap` loads the approved public corpus
  through the accepted pipeline, so preparing a local instance is an operator action rather than
  something only a test fixture knows how to do. Three independent conditions decide eligibility —
  `visibility: PUBLIC`, `knowledge_space: AROORAA_PUBLIC`, and a `review_status` other than
  `NEEDS_OWNER_APPROVAL` — and it refuses to start at all when the embedding configuration could
  not produce usable vectors, rather than filling a database with approved-but-unsearchable content.

## What A3.2 fixed (the first real conversations)

The first run against the real providers surfaced two defects the secretless suite could not have
caught, and one question about encoding that needed measuring rather than guessing.

- **Optimistic-lock failure on the second turn.** `ConversationOrchestrator.respond` used to accept
  a loaded `AuraConversation` and save it again. That entity was detached — the read transaction it
  came from had already committed — and `save()` on a detached entity is `merge()`, which returns a
  *new* managed copy and leaves the caller's object holding the version it was loaded with. A caller
  that kept the object (as the real-provider script does) merged a stale version on its second turn:
  first turn 0 == 0 and passes, second turn 0 != 1 and throws `ObjectOptimisticLockingFailureException`.
  The HTTP tests never saw it because a fresh request reloads the conversation by accident.
  **The fix is the API, not the locking:** `respond` now takes the conversation's public id and
  loads it inside its own transaction, so the entity is managed for the whole turn and the row is
  updated by Hibernate's dirty check instead of a merge of someone's copy. No entity crosses a
  transaction boundary, so none can go stale. `@Version` is untouched, still bumps on every turn,
  and still rejects a genuinely concurrent write — `ConversationPersistenceIT` asserts both halves.
  There is deliberately no retry anywhere in this path: a stale write should be visible.
- **Greetings no longer perform RAG.** "Hi Aura" contains "Aura", matched the organisation-subject
  rule, became a `GROUNDED_QA` question, and searched a corpus that has no document about saying
  hello — returning the nearest vectors it could find (MESA, AI/Data, Mindra) and reporting
  `WEAK_EVIDENCE`. A new `ConversationMode.SOCIAL`, checked after confidentiality and before the
  organisation rule, routes a pure opener to no retrieval, no evidence and no sources, while
  language, tone and session memory work exactly as before. It is narrow on purpose: an opener is
  social only when *every* token is a greeting or greeting padding, so "Hi Aura, what is MESA?"
  stays the question it is.
- **The `?` characters in the log were the console, not the data.** `UnicodeRoundTripIT` measures
  the whole path — JSON in → JPA → Postgres → JPA → JSON out — for emoji (including a
  supplementary-plane surrogate pair), Tamil with combining marks, en dash, em dash and the curly
  apostrophe, comparing by code point, and separately checks `length()` vs `octet_length()` inside
  Postgres so the storage claim is made on the database's side of the wire. Everything round-trips
  exactly. The substitution happens when a forked JVM's stdout is re-encoded for a Windows console
  that cannot represent those characters, which is a rendering artefact and **not** something to fix
  in business logic. `RealProviderConversationIT` therefore writes its transcript to
  `target/aura-real-provider-transcript.md` in UTF-8 — read that file, not the terminal.

## What A3.3 fixed (the first real owner conversation)

Four things the owner hit while actually talking to Aura. None of them changed what Aura is; all
four were places where a turn was routed or sourced wrongly.

- **Small talk is a mode, not a consulting question.** "Tell me the joke" came back
  `GENERAL_CONSULTING`. The joke was fine — controlled light humour is part of the personality —
  but the routing was not. `SOCIAL` now covers four closed families: greetings, light humour
  (asking for or reacting to a joke), thanks/goodbyes, and one-word reactions. Still narrow by
  construction: every token must be a social word or social padding, so "tell me a joke" is small
  talk and "tell me a joke about the election" is a request to write something and stays out of it.
- **Retrieval for project discovery is now a per-turn decision.** "எனக்கு ஒரு software product
  idea இருக்கு." retrieved and came back `WEAK_EVIDENCE` with sources — the same nearest-vector
  noise a greeting produced, because a discovery opener contains no question. `RetrievalPlanner`
  reads `ScopeDecision.mentionsOrganisationSubject()` instead of turning the mode off wholesale:
  "I have an app idea" looks nothing up, "I have a product idea — what services can AROORAA
  provide?" is still discovery and is still grounded. The classifier had to change with it, so
  that a first-person project statement outranks the organisation rule while a capability question
  sharing the same verb ("Can AROORAA modernize an existing application?") does not.
- **Section eligibility: a PUBLIC document is not public all the way down.** "What about MESA"
  returned a citation reading *"What Aura must not disclose about MESA"*. That section is real and
  it is in a PUBLIC document — it is guidance for Aura, and its body also names an internal policy
  file. Five public seed documents carry sections like it. `SectionEligibility` now decides, and
  the decision happens at chunking time so an ineligible section produces **no chunk at all** —
  nothing to retrieve, nothing to put in a prompt, nothing to cite. Hiding it at the API layer
  would have left the model still reading confidentiality instructions as facts about MESA.
  Authors mark a section with `<!-- retrievable: false -->` under its heading; a heading that
  plainly instructs the assistant is caught even unmarked, as a backstop. The same predicate runs
  on the retrieval path, so a chunk indexed before this rule — everything already in the owner's
  local database — stops being usable immediately rather than after a re-ingestion. Editorial
  `<!-- NEEDS_OWNER_APPROVAL: ... -->` notes are stripped from chunk text for the same reason.
  `AURA_POLICY` exclusion is untouched and still enforced twice over.
- **A citation's link is a link, or nothing.** Found while reading the citation path for the
  above: a version's `source` frontmatter records where its facts came from, and in the seed that
  is usually a path inside our own repository (`frontend-v2/src/lib/content/products.ts`). It was
  being handed to visitors as the citation URL. `ResponseAssembler` now emits a URL only when it is
  one a visitor could open; otherwise the citation keeps its title and carries no link. Editorial
  cross-references between seed files (`` (`91-aura-confidentiality-and-safety.md`) ``) are
  stripped from chunk text for the same reason — they name internal documents.
- **A test was being propped up by the defect.** `AuraChatApiIT` asserted that a MESA question
  produces sources, and it passed — because the top-ranked chunk for "What is MESA?" was the
  section headed *"What Aura must not disclose about MESA"*, which shares almost every word with
  the question. Removing the section made the assertion fail and exposed the real problem
  underneath: `StubEmbeddingProvider`'s similarity scale (0.21–0.26 for a genuine MESA answer) is
  nothing like the real provider's (0.58–0.74), so the shipped thresholds classify everything in
  that suite as NO_EVIDENCE. The suite now sets stub-scale thresholds explicitly, with the measured
  numbers written down; the shipped values are unchanged and still asserted against real
  measurements in `EvidenceBandsIT` and `EmbeddingCalibrationIT`.
- **Concise by default.** The real MESA answer was accurate and brochure-shaped. This is prompt
  policy, not a guardrail: `AuraPolicy` now asks for the direct answer first, one or two short
  paragraphs for an opening "what is X?", says explicitly that long approved material is a reason
  to be accurate rather than exhaustive, and asks for varied endings instead of closing every
  message with "feel free to ask". Deliberately *not* enforced by the output guardrail — deleting
  a natural closing sentence would damage more answers than it saved.

## A4 — Aura on the website (local only)

Aura now runs inside the real `frontend-v2` site rather than the `/aura-test` page. Nothing is
deployed and nothing is publicly exposed: this is a local integration the owner drives from the
actual AROORAA UI.

- **Where it lives.** `frontend-v2/src/lib/aura/` (API client, session, rich-text parser, state
  model, conversation hook) and `frontend-v2/src/components/aura/` (mark, launcher, panel,
  composer, sources). Mounted once in the `(public)` layout, so it is present on every public page
  and survives navigation — a conversation started on the home page is still going at
  `/products/mesa`. The admin app has its own layout and deliberately does not get it.
- **No component knows a URL.** `AuraApiClient` is the only thing that speaks HTTP, and it asks its
  own origin: `/api/aura/conversations`. Failures come back as typed values rather than exceptions,
  matching the Contact/Start-a-Project adapters already in that codebase.
- **Same-origin locally, via the existing dev-proxy convention.** `next.config.ts` already rewrites
  `/api/admin/*` to lead-service; A4 adds `/api/aura/*` → `http://localhost:8091/api/v1/aura/*`. The
  browser therefore never makes a cross-origin request and **no CORS is needed at all** for the
  normal local setup. Production would do the same thing with the real Nginx proxy at the same
  relative path — out of scope here, and untouched.
- **CORS exists but is closed.** `aura.cors.allowed-origins` is empty by default, which registers no
  `CorsConfigurationSource` bean, so this service emits no CORS headers and has no wildcard branch
  to fall through to. It is there only for a developer who would rather point
  `NEXT_PUBLIC_AURA_API_BASE_URL` straight at `:8091`. `ChatSurfaceDisabledByDefaultIT` asserts the
  closed default; `AuraCorsIT` asserts that a configured origin works, that any other origin does
  not, that the allowance covers the chat API and nothing else, and that credentials are never
  allowed.
- **Page awareness, and only that.** The pathname from `usePathname()` travels with every message,
  so "tell me more about this" works on `/products/mesa`. No DOM, no page HTML, no query string —
  and the backend has always treated `currentPath` as a hint rather than as authorization.
- **Nothing renders as HTML.** Model output is parsed into a small closed document model
  (paragraphs, bullets, bold/italic/code) and rendered as React elements. There is no
  `dangerouslySetInnerHTML` anywhere in the Aura UI, so a response containing `<script>` renders as
  those characters. Citation links are filtered to `http(s)` only.
- **Secrets.** The browser talks to aura-service, and aura-service talks to the model provider —
  never the browser directly. No `NEXT_PUBLIC_*` variable carries a secret; the static export was
  checked for a key and for a hard-coded backend host, and contains neither.
- **Static export preserved.** No server actions, no route handlers, no SSR dependency. The panel is
  loaded through `next/dynamic` on first open, so a visitor who never opens Aura downloads the
  launcher and nothing more.

### Reviewing it visually

`/design-system/aura` renders every state from the real components — launcher, first open, grounded
answer, sources collapsed and expanded, thinking, error, internal boundary, diagnostics. `?only=<id>`
shows one state filling the viewport, and `?device=mobile` frames each state in its own 390×844
iframe, which is how the mobile sheet can be seen at its true size without resizing the window.
Captures live in `frontend-v2/design-assets/aura-review/`. Like `/design-system`, the page is
`noindex` and carries a banner: it is an internal review surface to remove before public launch.

### Running the real-provider gates

`failsafe:integration-test` records results to disk and returns successfully by design; only
`failsafe:verify` reads them back and fails the build. Run alone, the first goal happily prints
`BUILD SUCCESS` over a report saying `Errors: 1` — which is exactly what happened in A3.1. Always
run both goals:

```powershell
mvn -o failsafe:integration-test failsafe:verify "-Dit.test=RealProviderConversationIT"
mvn -o failsafe:integration-test failsafe:verify "-Dit.test=EmbeddingCalibrationIT"
```

A run counts as acceptance only with `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0` **and**
`BUILD SUCCESS`. `Skipped: 1` means `OPENAI_API_KEY` was not visible to that shell, not that the
gate passed. (A plain `mvn -o verify` is already safe: the POM binds both failsafe goals.)

## What A4.1 fixed (page awareness)

The owner tested Aura on `/products/mesa` and asked "Tell me more about this." It came back
`GENERAL_CONSULTING` / `NO_EVIDENCE` — generic platform talk with no MESA evidence at all.

The cause is plain once the classifier is read in order: "tell me more about this" names no
organisation subject, matches no other rule, and lands on the `GENERAL_CONSULTING` catch-all, which
`RetrievalPlanner` deliberately does not search for. `currentPath` reached the prompt as a hint
(A3) but nothing ever resolved the pronoun, so retrieval was never given a subject to look for.

`PageAwareScopeResolver` (pipeline stage 3.5) closes exactly that gap, and nothing wider:

- **The subject can only come from a fixed registry.** `PageContextRegistry` maps known public
  routes to canonical subjects; anything else resolves to nothing. A client-supplied path can never
  name a subject the registry does not already know, never selects a knowledge space, and never
  widens what a turn may see — `currentPath` stays context, not authorization.
- **It only ever narrows a fallback.** It fires when the classifier's own verdict was one of the
  two "nothing to look up" outcomes — `GENERAL_CONSULTING`, or `PROJECT_DISCOVERY` without
  `mentionsOrganisationSubject()` — *and* the message is a contextual reference *and* the path
  resolves. `INTERNAL_BOUNDARY` is decided before either eligible mode can be reached, so a
  confidentiality probe is untouched by construction rather than by a special case.
  The `PROJECT_DISCOVERY` branch is not theoretical: "How could this help my existing application?"
  contains "existing application", one of `ScopeClassifier`'s own weak discovery markers, and is
  already `PROJECT_DISCOVERY` before this stage runs.
- **The visitor's words are never rewritten.** The transcript and the model's user turn stay
  exactly what was typed. Only the internal retrieval query changes, and it is *replaced* rather
  than appended to — measured under the stub embedder, "Tell me more about this. MESA" still scored
  0.085 (the pronoun and filler dominate a bag-of-words query), while "Tell me about MESA" scored
  0.180 against the same corpus. Appending the subject looks like the safer edit and fixes nothing.

## Running Aura locally for a manual session

Windows PowerShell, from `C:\MM\Arooraa\aura-service`. Both the chat surface and the bootstrap
default to off, so a run without these variables exposes nothing and loads nothing.

```powershell
# 1. infrastructure
docker compose up -d

# 2. the API key, for this shell session only — never committed, never echoed
$env:OPENAI_API_KEY = Read-Host -Prompt "OpenAI API key" -MaskInput

# 3. load the approved public corpus (one-shot; idempotent, safe to rerun)
$env:AURA_EMBEDDING_PROVIDER_ENABLED = "true"
$env:AURA_EMBEDDING_GENERATION = "2"
$env:AURA_BOOTSTRAP_PUBLIC_KNOWLEDGE = "true"
$env:AURA_BOOTSTRAP_EXIT_AFTER = "true"
mvn -o spring-boot:run

# 4. start Aura for chatting
$env:AURA_BOOTSTRAP_PUBLIC_KNOWLEDGE = "false"
$env:AURA_BOOTSTRAP_EXIT_AFTER = "false"
$env:AURA_CHAT_ENABLED = "true"
$env:AURA_CHAT_DIAGNOSTICS_ENABLED = "true"
$env:AURA_CHAT_PROVIDER_ENABLED = "true"
mvn -o spring-boot:run
```

Then open `http://localhost:8091/aura-test`.

If emoji or Tamil appear as `?` in the console, that is the terminal, not Aura — the stored and
returned text is correct (proved by `UnicodeRoundTripIT`). `chcp 65001` before running makes the
console draw them, and the browser at `/aura-test` shows them correctly either way.

A3.3 edited four seed documents to mark their assistant-guidance sections, so step 3 re-versions
`10-mesa`, `41-project-engagement`, `42-contact-and-support` and `50-public-product-status` on the
next run and re-embeds them — that is the normal content-change path, and it is what removes the
old guidance chunks from the active corpus. Documents whose bodies did not change keep the chunks
they already have; retrieval excludes any guidance section in them regardless.

Step 3 runs the ordinary import → approve → chunk → embed → activate pipeline over
`knowledge-seed/`, indexing only documents that are `visibility: PUBLIC`, in the `AROORAA_PUBLIC`
knowledge space, and not marked `review_status: NEEDS_OWNER_APPROVAL`. It reports every document it
saw, indexed or skipped, by slug and reason. There is deliberately no HTTP endpoint that mutates
knowledge — loading is an operator action or nothing.

## What deliberately does NOT exist yet

No ingestion HTTP surface (ingestion runs via services driven by tests/local tooling — there is
deliberately no knowledge-mutation endpoint at all), no feedback/knowledge-gap tracking, no
project-brief generation, no lead creation, no reranking adapter (the RRF-fused order is the
deterministic ranking baseline; `RerankingProvider` stays a disabled-by-default extension point),
no tools/actions, no voice, no admin UI, no arooraa.com integration and no deployment. The public
chat surface comes only after the owner has accepted these conversations.
