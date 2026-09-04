# Aura — visual review

Captures of every Aura state from the real components and the real stylesheets, so the experience
can be judged by looking at it rather than by reading a test report.

A4.1 replaced the orb with the Aura Spark and the empty composer with the guided entry. A4.2 then
took the citations and the routing metadata out of the conversation entirely, so `04` is that
milestone's real before/after: a grounded answer carrying two citations and full diagnostics, with
none of it on screen. A5/A5.1 add voice — `12` through `16` — which is the first time the composer
has gained a control since it was designed, so every capture below was retaken.

A5.2.2 is the owner's second round of real testing, and `21` and `22` are its visible half: a
guided choice that opens a page now answers first, in Aura's own words, where it used to change the
route and say nothing. The other half of that correction — what "New" clears — is not a state that
can be photographed, because it is the absence of one; `03` and `12` are what the panel looks like
after it, which is the whole point.

A5.2 is the owner's own before/after on voice, from real testing. `12` is the first: the permanent
"Speak naturally — English · தமிழ் · Tanglish" row is gone from the guided entry entirely. `17` is
where that guidance went — the first microphone use, once per browser. And `13`, `17`, `18` and
`20` are the answer to "I cannot tell whether Aura is listening": recording now replaces the
composer with a stage of its own rather than tinting a 44px button.

| File | What it shows |
| --- | --- |
| `01-homepage-launcher-desktop.png` | Closed launcher — the Aura Spark on the real home page, 1440×900 |
| `02-all-states-desktop.png` | Every state on one page, 1440 wide |
| `03-desktop-first-open.png` | First open — guided entry, four openings plus two quieter ones |
| `03b-desktop-products.png` | Guided entry, Products level — public names and short taglines |
| `03c-desktop-services.png` | Guided entry, Services level — the six approved groups |
| `04-desktop-grounded.png` | **What a visitor sees**: message, answer, composer. Nothing else |
| `05-desktop-dev-inspector.png` | The same turn with the developer inspector open — the only surface that shows citations, routing metadata or voice timings, and no public build contains it |
| `06-desktop-thinking.png` | Thinking state |
| `07-desktop-error.png` | Network failure, with a retry |
| `08-desktop-internal-boundary.png` | Boundary turn — answered warmly, with no mode label |
| `09-mobile-states-390x844.png` | Every state at a true 390×844 mobile viewport, guided entry included |
| `10-launcher-on-mesa-page-live.png` | Launcher on `/products/mesa`, from a running `next dev` |
| `11-mobile-widths-320-375-390-430.png` | The grounded answer at all four review widths |
| `12-desktop-voice-first-open.png` | **A5.2**: guided entry with voice available — four openings, a microphone and a speaker, and **no permanent language row** |
| `13-desktop-voice-listening.png` | Recording, for somebody who has spoken to Aura before: the Spark listening, a meter that moves with the room, a clock counting up, the word itself, and both ways out |
| `14-desktop-voice-speaking.png` | Aura reading an answer aloud, with Stop |
| `15-desktop-voice-replay.png` | **A5.1**: the moment after it finishes — one offer to hear it again, for that turn only |
| `16-mobile-voice-widths.png` | The recording stage at 320, 375, 390 and 430 — nothing overflows and both controls stay at 44px |
| `17-desktop-voice-first-listening.png` | **A5.2**: the first microphone use in this browser. The same stage, plus one line of guidance that never appears again |
| `18-desktop-voice-processing.png` | Working out what was said — "Understanding…", in the visitor's language rather than ours. No provider name, no upload vocabulary, and no clock, because nothing is being timed any more |
| `19-desktop-voice-canonical-transcript.png` | **A5.2**: the visitor said MESA, the provider heard "Meesa", and the composer holds "Tell me about MESA" — waiting for them to press send. Only names in the approved registry are ever touched |
| `20-mobile-voice-first-listening-widths.png` | The first-use stage at all four widths — the guidance holds one line even at 320 |
| `21-desktop-guided-navigation-reply.png` | **A5.2.2**: the visitor pressed About AROORAA, and Aura said so. Fixed copy written in `guided-entry.ts`, committed before the navigation and asked of no provider — where this used to be a route change with no reply at all |
| `22-mobile-guided-navigation-widths.png` | The same exchange at 320, 375, 390 and 430 — the reply wraps rather than overflowing, and nothing else moves |

## Regenerating

The source is the live page at `/design-system/aura`, which takes two query parameters:
`?only=<id>` renders one state filling the viewport, `?device=mobile` frames every state in its
own 390×844 iframe, and `?device=widths` frames one state (the grounded answer unless `only=` says
otherwise) at 320, 375, 390 and 430. The iframe matters: Chrome and Edge on Windows both clamp
`--window-size` to a minimum window width, so a "390px" screenshot is really a wider viewport
cropped — an iframe is its own viewport and the mobile breakpoint and `dvh` height evaluate
correctly inside it.

**`npm run build` no longer serves these.** A8 moved both review pages to `page.review.tsx`, an
extension a production build does not recognise, so `/design-system/aura` is absent from `out/` by
design — which is the point of that change and not a regression. Captures now come from `next dev`.

```powershell
cd C:\MM\Arooraa\frontend-v2
npm run dev                         # :3000
# then, per shot:
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --hide-scrollbars --force-device-scale-factor=2 `
  --user-data-dir="$env:TEMP\aura-shots" --virtual-time-budget=12000 `
  --window-size=1440,900 `
  --screenshot="design-assets\aura-review\04-desktop-grounded.png" `
  "http://localhost:3000/design-system/aura?only=grounded"
```

Three things worth knowing before regenerating these, all learned the hard way:

- **Capture one shot per command and read the output.** Run in a tight loop, several of the Edge
  invocations silently fail to write while still exiting 0 — and because the target files already
  exist, the failure leaves the *previous* screenshot in place rather than producing an obvious
  gap. Check `stat -c '%y'` on the files, not just the exit codes. A5.2 found the reliable form:
  `Start-Process -Wait` with a *fresh* `--user-data-dir` per shot and a couple of seconds between
  them. Back-to-back invocations sharing a profile fail every time.
- **Delete the old file only once the new one exists.** Clearing targets first and then losing the
  captures leaves a gap where screenshots used to be; git is what got them back here.
- **`?only=navigation-acknowledged`** renders the guided-navigation reply from the same fixed copy
  the panel uses, so the capture is the real sentence rather than an illustration of one.
- **`?only=products` / `?only=services`** render the nested guided levels directly, via the
  review-only `initialGuidedSection` prop on `AuraPanel`, so no click is needed to capture them.
  `?only=inspector` does the same for the developer inspector, which the review page also opens
  via `devDiagnosticsOpen` — otherwise a capture would show a closed bar and nothing in it. The
  four voice states use a stub voice controller (`stubAuraVoice`) for the same reason: no
  microphone, no backend, and every state reachable by URL.
- **The Next.js dev overlay (a small dark circle) sits over the bottom-left of every capture now
  that these come from `next dev` rather than from a static export.** It is the framework's own
  indicator, not part of Aura, and in the width grids it lands on the Cancel button. Worth knowing
  before reading it as a layout fault.
- **Done carries a focus ring in the recording captures.** That is correct: the stage moves focus
  there so a keyboard visitor can stop without hunting for it, and headless Edge treats programmatic
  focus as focus-visible.
- **A small ✕ appears in the left margin of every `?only=` capture, and is not in the page.** The
  DOM contains exactly one close button (checked with `--dump-dom`), it survives a fresh browser
  profile, and it is absent from the live capture in `10`. It is an artefact of headless Edge's
  compositor, has been in these captures since A4.1, and can be ignored — it is not something a
  visitor can ever see.

`10-…-live.png` is the exception: it comes from `npm run dev` on `:3000`, so it shows Aura mounted
on the real site rather than on the review page. aura-service does not need to be running for it —
the launcher makes no request until a message is sent.
