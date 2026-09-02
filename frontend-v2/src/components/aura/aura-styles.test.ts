import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The layout guarantees jsdom cannot check.
 *
 * <p>A component test renders at one notional size and never evaluates a media query, so nothing
 * in the rest of this suite would notice if the mobile sheet, the safe-area padding or the
 * reduced-motion blocks were deleted. These read the stylesheets and assert the rules are present.
 *
 * <p>Worth being clear about what this is: a regression guard, not a rendering test. It proves the
 * rule exists, not that it looks right — that judgement is the owner's, from the screenshots.
 */
const DIR = path.resolve(__dirname);

function css(file: string): string {
  return readFileSync(path.join(DIR, file), "utf8");
}

const PANEL = css("AuraPanel.module.css");
const LAUNCHER = css("AuraLauncher.module.css");
const COMPOSER = css("AuraComposer.module.css");
const MARK = css("AuraMark.module.css");
const GUIDED = css("AuraGuidedEntry.module.css");
const INSPECTOR = css("AuraDevInspector.module.css");
const RICH_TEXT = css("AuraRichText.module.css");
const MIC = css("AuraMicButton.module.css");
const SPEAKER = css("AuraSpeakerButton.module.css");
const CUE = css("AuraVoiceCue.module.css");

describe("Aura layout contract", () => {
  it("gives mobile its own layout rather than a scaled-down panel", () => {
    expect(PANEL).toMatch(/@media \(max-width: 600px\)/);
    // A sheet pinned to the bottom edge across the full width, not a floating box.
    expect(PANEL).toMatch(/inset: auto 0 0 0/);
    expect(PANEL).toMatch(/inline-size: 100%/);
  });

  it("sizes the panel so it cannot overflow the narrowest phone", () => {
    // 320px is the narrowest viewport in the brief; min() with a viewport-relative fallback means
    // the desktop width can never win on a screen smaller than it.
    expect(PANEL).toMatch(/inline-size: min\(408px, calc\(100vw - 2 \* var\(--space-5\)\)\)/);
    expect(PANEL).toMatch(/overflow-x: hidden/);
  });

  it("uses dvh on mobile so the keyboard shortens the sheet instead of hiding the composer", () => {
    expect(PANEL).toMatch(/block-size: min\(88dvh/);
  });

  it("respects the safe area on both the launcher and the sheet", () => {
    expect(LAUNCHER).toMatch(/env\(safe-area-inset-bottom, 0px\)/);
    expect(LAUNCHER).toMatch(/env\(safe-area-inset-right, 0px\)/);
    expect(PANEL).toMatch(/env\(safe-area-inset-bottom, 0px\)/);
  });

  it("keeps every touch target at 44px or more", () => {
    expect(LAUNCHER).toMatch(/min-block-size: 44px/);
    expect(COMPOSER).toMatch(/block-size: 44px/);
    // The desktop header controls are compact; the mobile block raises them.
    const mobileBlock = PANEL.slice(PANEL.indexOf("@media (max-width: 600px)"));
    expect(mobileBlock).toMatch(/min-block-size: 44px/);
  });

  it("keeps the composer at 16px so iOS does not zoom the page on focus", () => {
    expect(COMPOSER).toMatch(/font-size: 16px/);
  });

  it("lets long unbroken text wrap instead of widening the panel", () => {
    expect(RICH_TEXT).toMatch(/overflow-wrap: anywhere/);
    expect(PANEL).toMatch(/overflow-wrap: anywhere/);
  });

  it("keeps the composer free of scrollbar chrome until the message outgrows it", () => {
    // A textarea reserves the scrollbar the moment overflow is `auto`, which put native scroll
    // arrows next to a one-line message on Windows. The stylesheet starts it hidden; the component
    // switches it on only past max-block-size.
    expect(COMPOSER).toMatch(/overflow-y: hidden/);
    expect(COMPOSER).not.toMatch(/overflow-y: auto/);
  });

  it("switches every Aura animation off under prefers-reduced-motion", () => {
    for (const [name, sheet] of Object.entries({ PANEL, LAUNCHER, COMPOSER, MARK, GUIDED, INSPECTOR })) {
      expect(sheet, `${name} should honour prefers-reduced-motion`).toMatch(
        /@media \(prefers-reduced-motion: reduce\)/,
      );
    }
    // The mark is the only thing that animates continuously, so it is the one that must stop dead.
    expect(MARK).toMatch(/animation: none !important/);
  });

  it("builds on the site's design tokens rather than its own palette", () => {
    // Aura should look like part of AROORAA, which means it must not introduce colours.
    for (const [name, sheet] of Object.entries({ PANEL, LAUNCHER, COMPOSER, GUIDED, INSPECTOR })) {
      const hexes = sheet.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect(hexes, `${name} should use design tokens, found ${hexes.join(", ")}`).toHaveLength(0);
    }
  });

  it("keeps guided-menu rows at a real touch target on mobile", () => {
    expect(GUIDED).toMatch(/@media \(max-width: 600px\)/);
    const mobileBlock = GUIDED.slice(GUIDED.indexOf("@media (max-width: 600px)"));
    expect(mobileBlock).toMatch(/min-block-size: 44px/);
  });

  it("gives every voice control a real touch target", () => {
    expect(MIC).toMatch(/inline-size: 44px/);
    expect(MIC).toMatch(/block-size: 44px/);
    // The speaker is a narrower target on desktop, where it is a preference rather than an action,
    // and widens to the full 44px on touch.
    const speakerMobile = SPEAKER.slice(SPEAKER.indexOf("@media (max-width: 600px)"));
    expect(speakerMobile).toMatch(/inline-size: 44px/);
    const composerMobile = COMPOSER.slice(COMPOSER.indexOf("@media (max-width: 600px)"));
    expect(composerMobile).toMatch(/min-block-size: 44px/);
  });

  it("keeps recording legible with motion switched off", () => {
    // The pulse is decoration. Colour and fill carry the state on their own, which is what a
    // visitor with prefers-reduced-motion has to rely on.
    expect(MIC).toMatch(/data-recording="true"/);
    expect(MIC).toMatch(/background: var\(--color-error\)/);
    const reduced = MIC.slice(MIC.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/animation: none/);
  });

  it("distinguishes the three voice states on the mark without relying on motion", () => {
    for (const state of ["LISTENING", "PROCESSING_AUDIO", "SPEAKING"]) {
      expect(MARK, `the mark should have a ${state} rule`).toContain(`data-state="${state}"`);
    }
    const reduced = MARK.slice(MARK.indexOf("@media (prefers-reduced-motion: reduce)"));
    // With everything still, each of the three still looks different: listening changes colour,
    // and the other two change the core's scale in opposite directions.
    expect(MARK).toMatch(/\[data-state="LISTENING"\] \{\s*--aura-mark-color/);
    expect(reduced).toMatch(/\[data-state="PROCESSING_AUDIO"\] \.core/);
    expect(reduced).toMatch(/\[data-state="SPEAKING"\] \.core/);
  });

  it("keeps the voice surfaces on the design tokens too", () => {
    for (const [name, sheet] of Object.entries({ MIC, SPEAKER, CUE })) {
      const hexes = sheet.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect(hexes, `${name} should use design tokens, found ${hexes.join(", ")}`).toHaveLength(0);
    }
  });

  it("switches the voice animations off under prefers-reduced-motion", () => {
    for (const [name, sheet] of Object.entries({ MIC, SPEAKER })) {
      expect(sheet, `${name} should honour prefers-reduced-motion`).toMatch(
        /@media \(prefers-reduced-motion: reduce\)/,
      );
    }
  });
});
