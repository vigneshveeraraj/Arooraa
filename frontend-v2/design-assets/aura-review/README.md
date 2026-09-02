# Aura — visual review

Captures of every Aura state from the real components and the real stylesheets, so the experience
can be judged by looking at it rather than by reading a test report.

Regenerated for A4.1: the circular orb mark is gone (replaced by the Aura Spark) and the empty
composer is gone (replaced by the guided entry), so every capture below is new.

| File | What it shows |
| --- | --- |
| `01-homepage-launcher-desktop.png` | Closed launcher — the Aura Spark on the real home page, 1440×900 |
| `02-all-states-desktop.png` | Every state on one page, 1440 wide |
| `03-desktop-first-open.png` | First open — guided entry, four openings plus two quieter ones |
| `03b-desktop-products.png` | Guided entry, Products level — public names and short taglines |
| `03c-desktop-services.png` | Guided entry, Services level — the six approved groups |
| `04-desktop-grounded.png` | Grounded answer, sources collapsed |
| `05-desktop-sources-expanded.png` | Sources expanded — title and section only |
| `06-desktop-thinking.png` | Thinking state |
| `07-desktop-error.png` | Network failure, with a retry |
| `08-desktop-internal-boundary.png` | Boundary turn — no sources section at all |
| `09-mobile-states-390x844.png` | Every state at a true 390×844 mobile viewport, guided entry included |
| `10-launcher-on-mesa-page-live.png` | Launcher on `/products/mesa`, from a running `next dev` |

## Regenerating

The source is the live page at `/design-system/aura`, which takes two query parameters:
`?only=<id>` renders one state filling the viewport, and `?device=mobile` frames every state in its
own 390×844 iframe. The iframe matters: Chrome and Edge on Windows both clamp `--window-size` to a
minimum window width, so a "390px" screenshot is really a wider viewport cropped — an iframe is its
own viewport and the mobile breakpoint and `dvh` height evaluate correctly inside it.

```powershell
cd C:\MM\Arooraa\frontend-v2
npm run build                       # static export into out/
npx serve out -l 4173
# then, per shot:
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --hide-scrollbars --force-device-scale-factor=2 `
  --user-data-dir="$env:TEMP\aura-shots" --virtual-time-budget=12000 `
  --window-size=1440,900 `
  --screenshot="design-assets\aura-review\04-desktop-grounded.png" `
  "http://localhost:4173/design-system/aura?only=grounded"
```

Two things worth knowing before regenerating these, both learned the hard way:

- **Capture one shot per command and read the output.** Run in a tight loop, several of the Edge
  invocations silently fail to write while still exiting 0 — and because the target files already
  exist, the failure leaves the *previous* screenshot in place rather than producing an obvious
  gap. Check `stat -c '%y'` on the files, not just the exit codes.
- **`?only=products` / `?only=services`** render the nested guided levels directly, via the
  review-only `initialGuidedSection` prop on `AuraPanel`, so no click is needed to capture them.

`10-…-live.png` is the exception: it comes from `npm run dev` on `:3000`, so it shows Aura mounted
on the real site rather than on the review page. aura-service does not need to be running for it —
the launcher makes no request until a message is sent.
