import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "./SiteHeader";
import { PRIMARY_NAV_LINKS, START_PROJECT_LINK } from "@/lib/content/navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SiteHeader", () => {
  it("renders the AROORAA brand link, pointing home", () => {
    render(<SiteHeader />);
    const brand = screen.getByRole("link", { name: "AROORAA — home", hidden: true });
    expect(brand).toHaveAttribute("href", "/");
  });

  it("uses the real logo images as the primary brand mark, not plain text", () => {
    render(<SiteHeader />);
    const brand = screen.getByRole("link", { name: "AROORAA — home", hidden: true });
    const images = brand.querySelectorAll("img");
    expect(images).toHaveLength(2);
    expect(brand.textContent).toBe("");
  });

  it("gives the logo images an empty alt so the link's own aria-label is the only announced name", () => {
    render(<SiteHeader />);
    const brand = screen.getByRole("link", { name: "AROORAA — home", hidden: true });
    for (const img of brand.querySelectorAll("img")) {
      expect(img).toHaveAttribute("alt", "");
    }
    // Exactly one accessible name, not "AROORAA logo AROORAA — home".
    expect(screen.getAllByRole("link", { name: "AROORAA — home", hidden: true })).toHaveLength(1);
  });

  it("does not load a broken image path for either brand asset", () => {
    render(<SiteHeader />);
    const brand = screen.getByRole("link", { name: "AROORAA — home", hidden: true });
    for (const img of brand.querySelectorAll("img")) {
      const src = img.getAttribute("src") ?? "";
      expect(src.startsWith("/images/brand/")).toBe(true);
      expect(src.endsWith(".webp")).toBe(true);
    }
  });

  it("renders every frozen primary navigation link with the correct href", () => {
    render(<SiteHeader />);
    for (const link of PRIMARY_NAV_LINKS) {
      expect(screen.getByRole("link", { name: link.label, hidden: true })).toHaveAttribute("href", link.href);
    }
  });

  it("renders a Start a Project CTA (desktop and compact variants) pointing at /start-project", () => {
    render(<SiteHeader />);
    const ctas = screen.getAllByRole("link", { name: /^start/i, hidden: true });
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", START_PROJECT_LINK.href);
    }
  });

  it("exposes an accessible, initially-closed menu toggle", () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: /open menu/i, hidden: true });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the mobile navigation and flips aria-expanded when the toggle is clicked", async () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: /open menu/i, hidden: true });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Site navigation" })).toBeInTheDocument();
  });

  // W4.7: .desktopCta/.compactCta and Button's own base `.button { display:
  // inline-flex }` rule are all single-class selectors (specificity 0,1,0).
  // Next's per-route CSS chunking does not guarantee SiteHeader's stylesheet
  // loads after Button's, so on several routes the tie went to Button and
  // neither `display: none` ever applied — both CTAs rendered simultaneously
  // at every breakpoint. jsdom doesn't load real stylesheets, so this can't be
  // caught by rendering; it guards the compiled selector shape directly so a
  // future edit can't silently drop back to the losing bare-class form.
  it("scopes the desktop/compact CTA display toggles under .actions so they reliably outrank Button's own display rule", () => {
    const css = readFileSync(join(__dirname, "SiteHeader.module.css"), "utf8");
    expect(css).toMatch(/\.actions\s+\.desktopCta\s*\{\s*display:\s*none;?\s*\}/);
    expect(css).toMatch(/\.actions\s+\.compactCta\s*\{\s*display:\s*inline-flex;?\s*\}/);
    expect(css).toMatch(/\.actions\s+\.desktopCta\s*\{\s*display:\s*inline-flex;?\s*\}/);
    expect(css).toMatch(/\.actions\s+\.compactCta,\s*\n?\s*\.actions\s+\.menuButton\s*\{\s*display:\s*none;?\s*\}/);
    // Guard against a bare, unscoped selector reappearing anywhere.
    expect(css).not.toMatch(/(?<!\.actions\s)(?<!actions\s)\n\s*\.desktopCta\s*\{/);
    expect(css).not.toMatch(/(?<!\.actions\s)(?<!actions\s)\n\s*\.compactCta\s*\{/);
  });
});
