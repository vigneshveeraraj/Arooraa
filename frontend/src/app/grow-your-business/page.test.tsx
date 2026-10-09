import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// next/font is a build-time transform; under Vitest it only needs to hand back a class.
vi.mock("next/font/google", () => ({
  Noto_Sans_Tamil: () => ({ variable: "font-campaign-tamil", className: "", style: {} }),
}));

import GrowYourBusinessPage from "./page";

// jsdom has no matchMedia; the header listens for the desktop breakpoint while its menu is open.
vi.stubGlobal(
  "matchMedia",
  (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList,
);

const NEW_WHATSAPP = /^https:\/\/wa\.me\/918220503447\?text=/;

const withoutJoiners = (text: string | null) => (text ?? "").replace(/⁠/g, "");

function renderPage() {
  return render(<GrowYourBusinessPage />);
}

describe("Grow Your Business campaign page", () => {
  it("leads with the Tamil headline, marked as Tamil", () => {
    renderPage();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(withoutJoiners(heading.textContent)).toBe("உங்கள் Business-ஐ Digital-ஆ மாற்றலாம்");
    expect(heading).toHaveAttribute("lang", "ta");
  });

  it("never lets a Tamil suffix wrap away from its English word", () => {
    const { container } = renderPage();
    // Every "-" directly before Tamil script must carry a WORD JOINER (see keepSuffix.ts).
    expect(container.textContent).not.toMatch(/-[஀-௿]/);
    expect(container.textContent).toMatch(/Business-⁠ஐ/);
  });

  it("points every WhatsApp and call link at the official number", () => {
    const { container } = renderPage();
    const whatsappLinks = [...container.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]')];
    expect(whatsappLinks.length).toBeGreaterThanOrEqual(3);
    for (const link of whatsappLinks) {
      expect(link.getAttribute("href")).toMatch(NEW_WHATSAPP);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }

    const telLinks = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]')];
    expect(telLinks.length).toBeGreaterThan(0);
    for (const link of telLinks) expect(link).toHaveAttribute("href", "tel:+918220503447");

    expect(container.textContent).toContain("+91 82205 03447");
    expect(container.textContent).not.toMatch(/8760|87602/);
    expect(screen.getAllByRole("link", { name: "support@arooraa.com" })[0]).toHaveAttribute(
      "href",
      "mailto:support@arooraa.com",
    );
  });

  it("links to the main English site's real pages and sections only", () => {
    renderPage();
    const explore = screen.getByRole("navigation", { name: "Explore AROORAA" });
    expect(within(explore).getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
    expect(within(explore).getByRole("link", { name: "Products" })).toHaveAttribute("href", "/#mesa");
    expect(within(explore).getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", "/#work");
    expect(within(explore).getByRole("link", { name: "Main Website" })).toHaveAttribute("href", "/");
    expect(document.querySelector('a[href="/#products"]')).toBeNull();
  });

  it("has a working anchor target for every in-page link", () => {
    const { container } = renderPage();
    const anchors = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) {
      const id = anchor.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${id}`), `missing #${id}`).not.toBeNull();
    }
  });

  it("offers a skip link to the main content", () => {
    renderPage();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });

  it("opens and closes the mobile menu, returning focus to the toggle on Escape", async () => {
    const user = userEvent.setup();
    renderPage();

    const toggle = screen.getByRole("button", { name: "Open menu" });
    const menu = document.getElementById("campaign-menu")!;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "campaign-menu");
    expect(menu).not.toBeVisible();

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(menu).toBeVisible();
    expect(within(menu).getByRole("link", { name: /Portfolio/ })).toHaveAttribute("href", "/#work");

    await user.keyboard("{Escape}");
    expect(menu).not.toBeVisible();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(within(menu).getByRole("link", { name: "Industries" }));
    expect(menu).not.toBeVisible();
  });

  it("makes no statistical or rating claims and uses no emoji", () => {
    const { container } = renderPage();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/\d+\+/);
    expect(text).not.toMatch(/★|\bratings?\b|testimonial/i);
    // © is technically "pictographic" in Unicode; the footer's copyright line is fine.
    expect(text).not.toMatch(/(?![©®])\p{Extended_Pictographic}/u);
  });
});

describe("English site isolation", () => {
  // The campaign may link to the English site, never the other way round.
  const SRC = path.resolve(__dirname, "../..");
  const ENGLISH_SITE_DIRS = ["app/(marketing)", "components", "lib", "app/layout.tsx"];

  function sourceFiles(target: string): string[] {
    const full = path.join(SRC, target);
    if (!fs.existsSync(full)) return [];
    if (fs.statSync(full).isFile()) return [full];
    return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
      const child = path.join(target, entry.name);
      if (entry.isDirectory()) return sourceFiles(child);
      return /\.(tsx?|css)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path.join(SRC, child)] : [];
    });
  }

  it("does not link to /grow-your-business from any English-site source", () => {
    const files = ENGLISH_SITE_DIRS.flatMap(sourceFiles);
    expect(files.length).toBeGreaterThan(10);
    const offenders = files.filter((file) => fs.readFileSync(file, "utf8").includes("grow-your-business"));
    expect(offenders).toEqual([]);
  });
});
