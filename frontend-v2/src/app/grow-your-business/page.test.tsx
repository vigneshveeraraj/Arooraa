import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// next/font is a build-time transform; under Vitest it only needs to hand back a class.
vi.mock("next/font/google", () => ({
  Noto_Sans_Tamil: () => ({ variable: "font-campaign-tamil", className: "", style: {} }),
}));

// jsdom has no matchMedia; the header listens for the desktop breakpoint while its menu is open.
vi.stubGlobal(
  "matchMedia",
  (query: string) =>
    ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} }) as unknown as MediaQueryList,
);

import GrowYourBusinessPage, { metadata } from "./page";

const SRC = path.resolve(__dirname, "../..");
const PUBLIC = path.resolve(SRC, "../public");
const WHATSAPP = /^https:\/\/wa\.me\/918220503447\?text=/;
const plain = (text: string | null) => (text ?? "").replace(/⁠/g, "");

describe("/grow-your-business", () => {
  it("leads with the Tamil headline, marked as Tamil", () => {
    render(<GrowYourBusinessPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(plain(heading.textContent)).toBe("உங்கள் Business-ஐ Digital-ஆ மாற்றலாம்");
    expect(heading).toHaveAttribute("lang", "ta");
  });

  it("uses the real AROORAA logo assets in header and footer", () => {
    const { container } = render(<GrowYourBusinessPage />);
    const logos = [...container.querySelectorAll("img")].map((img) => img.getAttribute("src"));
    expect(logos.filter((src) => src === "/images/brand/arooraa-symbol.webp")).toHaveLength(2);
    expect(logos.filter((src) => src === "/images/brand/arooraa-wordmark.webp")).toHaveLength(2);
  });

  it("points every WhatsApp and call link at the official number", () => {
    const { container } = render(<GrowYourBusinessPage />);
    const whatsapp = [...container.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]')];
    expect(whatsapp.length).toBeGreaterThanOrEqual(4);
    for (const link of whatsapp) {
      expect(link.getAttribute("href")).toMatch(WHATSAPP);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    for (const link of container.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]')) {
      expect(link).toHaveAttribute("href", "tel:+918220503447");
    }
    expect(container.textContent).toContain("+91 82205 03447");
    expect(container.textContent).not.toMatch(/8760|87602/);
  });

  it("leads with Get a Free Consultation and Talk to Our Team, both opening the consultation form", () => {
    render(<GrowYourBusinessPage />);
    expect(screen.getByRole("link", { name: /Get a Free Consultation/ })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: "Talk to Our Team" })).toHaveAttribute("href", "#contact");
    const form = within(document.getElementById("contact")!);
    expect(form.getByRole("group", { name: "உங்களுக்கு என்ன தேவை?" })).toBeInTheDocument();
  });

  it("links into the English site only through its live routes", () => {
    const { container } = render(<GrowYourBusinessPage />);
    const internal = [...container.querySelectorAll<HTMLAnchorElement>("a[href^='/']")].map((a) => a.getAttribute("href"));
    expect(new Set(internal)).toEqual(new Set(["/", "/services", "/products", "/our-work"]));
    for (const route of ["/services", "/products", "/our-work"]) {
      expect(fs.existsSync(path.join(SRC, "app/(public)", route, "page.tsx")), route).toBe(true);
    }
  });

  it("has a target for every in-page link", () => {
    const { container } = render(<GrowYourBusinessPage />);
    for (const anchor of container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      const id = anchor.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${id}`), `missing #${id}`).not.toBeNull();
    }
  });

  it("labels every fictional business concept as illustrative", () => {
    render(<GrowYourBusinessPage />);
    expect(screen.getByText(/fictional builder, “Nilaa Homes”.*not a client project/)).toBeInTheDocument();
    for (const name of ["Maram Living", "Forgeline Industries", "Northbridge Advisors"]) {
      const article = screen.getByRole("article", { name });
      expect(within(article).getByText(/Illustrative design concept — fictional business/)).toBeInTheDocument();
    }
    expect(screen.getByText(/illustrative designs for fictional businesses, not client projects/)).toBeInTheDocument();
  });

  it("offers a skip link and an accessible, keyboard-closable mobile menu", async () => {
    const user = userEvent.setup();
    render(<GrowYourBusinessPage />);
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#campaign-main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "campaign-main");

    const menu = document.getElementById("campaign-menu")!;
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-controls", "campaign-menu");
    expect(menu).not.toBeVisible();

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(within(menu).getByRole("link", { name: /Our Work/ })).toHaveAttribute("href", "/our-work");

    await user.keyboard("{Escape}");
    expect(menu).not.toBeVisible();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });

  it("never lets a Tamil suffix wrap away from its English word", () => {
    const { container } = render(<GrowYourBusinessPage />);
    expect(container.textContent).not.toMatch(/-[஀-௿]/);
  });

  it("makes no statistical, rating or testimonial claims", () => {
    const { container } = render(<GrowYourBusinessPage />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\d+\s*%|\d+\+/);
    expect(text).not.toMatch(/★|\bratings?\b|testimonial/i);
  });

  it("publishes no prices — pricing is shared only on enquiry", () => {
    const { container } = render(<GrowYourBusinessPage />);
    const whatsappText = [...container.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]')].map((link) =>
      decodeURIComponent(new URL(link.href).searchParams.get("text") ?? ""),
    );
    const og = metadata.openGraph as { title: string; description: string };
    const PRICE = /₹|\bRs\.?\s*\d|\bINR\b|ரூ|\d{1,3}(,\d{2,3})+|\d\s*\/-|\b\d{4,6}\b/i;
    for (const text of [container.textContent, String(metadata.description), og.title, og.description, ...whatsappText]) {
      expect(plain(text).replaceAll("+91 82205 03447", "").replace(/© \d{4}/, "")).not.toMatch(PRICE);
    }
  });

  it("ships campaign SEO metadata with a canonical URL and a share image that exists", () => {
    expect(metadata.title).toBe("Business Website, AI & Automation Solutions | AROORAA");
    expect(metadata.alternates?.canonical).toBe("/grow-your-business");
    const og = metadata.openGraph as { title: string; images: { url: string; width: number; height: number }[] };
    expect(og.title).toBe("உங்கள் Business-ஐ Digital-ஆ மாற்றலாம் | AROORAA");
    expect(og.images[0]).toMatchObject({ width: 1200, height: 630 });
    expect(fs.existsSync(path.join(PUBLIC, og.images[0]!.url))).toBe(true);
  });
});

describe("campaign photography", () => {
  it("has a verified CC0 credit for every photo it ships", () => {
    const credits: { file: string; licence: string; verifiedOnSourcePage: boolean }[] = JSON.parse(
      fs.readFileSync(path.resolve(SRC, "../design-assets/campaign/photo-credits.json"), "utf8"),
    );
    const shipped = fs
      .readdirSync(path.join(PUBLIC, "images/campaign"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".webp"))
      .map((entry) => "/" + path.relative(PUBLIC, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"));
    expect(shipped.length).toBeGreaterThan(10);
    for (const file of shipped) {
      const credit = credits.find((entry) => entry.file === file);
      expect(credit, `no credit for ${file}`).toBeDefined();
      expect(credit!.licence).toBe("CC0 1.0");
      expect(credit!.verifiedOnSourcePage).toBe(true);
    }
  });
});

describe("campaign motion", () => {
  // Every stylesheet and component that renders on /grow-your-business.
  const CAMPAIGN_DIRS = [path.join(SRC, "components", "campaign"), path.join(SRC, "app", "grow-your-business")];

  function campaignSources(extension: RegExp): { file: string; source: string }[] {
    return CAMPAIGN_DIRS.flatMap((dir) =>
      fs
        .readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && extension.test(entry.name) && !entry.name.includes(".test."))
        .map((entry) => path.join(entry.parentPath, entry.name)),
    ).map((file) => ({ file: path.relative(SRC, file), source: fs.readFileSync(file, "utf8") }));
  }

  // The body of each @keyframes rule, found by brace matching since its frames nest one level.
  function keyframeBlocks(css: string): { name: string; body: string }[] {
    const blocks: { name: string; body: string }[] = [];
    for (const match of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
      let depth = 1;
      let end = match.index + match[0].length;
      while (depth > 0 && end < css.length) {
        if (css[end] === "{") depth++;
        if (css[end] === "}") depth--;
        end++;
      }
      blocks.push({ name: match[1]!, body: css.slice(match.index + match[0].length, end - 1) });
    }
    return blocks;
  }

  it("animates movement only, so nothing is invisible if an animation never runs", () => {
    // Regression: the hero devices and annotations faded in from opacity 0, so paused tabs,
    // background renders and screenshot tools caught them blank.
    const stylesheets = campaignSources(/\.css$/);
    const keyframes = stylesheets.flatMap(({ file, source }) => keyframeBlocks(source).map((block) => ({ file, ...block })));
    expect(keyframes.map(({ name }) => name)).toEqual(expect.arrayContaining(["rise", "pop"]));
    for (const { file, name, body } of keyframes) {
      expect(body, `${file} @keyframes ${name}`).not.toMatch(/\b(opacity|visibility)\s*:/);
    }
    for (const { file, source } of stylesheets) {
      for (const [declaration] of source.matchAll(/animation\s*:[^;]+;/g)) {
        expect(declaration, file).not.toMatch(/\b(forwards|both)\b/);
      }
    }
  });

  it("shows every section without waiting for a scroll-triggered reveal", () => {
    // Content below the fold must already be visible when it scrolls in — no observers,
    // scroll timelines or hidden-until-revealed resting states.
    for (const { file, source } of campaignSources(/\.tsx?$/)) {
      expect(source, file).not.toMatch(/IntersectionObserver|addEventListener\(\s*["']scroll["']|onScroll/);
    }
    for (const { file, source } of campaignSources(/\.css$/)) {
      expect(source, file).not.toMatch(/animation-timeline|view-timeline|scroll-timeline|\bview\(\)|\bscroll\(\)/);
      expect(source, file).not.toMatch(/opacity\s*:\s*0(\.0*)?\s*[;}]|visibility\s*:\s*hidden/);
    }

    render(<GrowYourBusinessPage />);
    for (const section of screen.getByRole("main").querySelectorAll("section")) {
      expect(section).toBeVisible();
    }
  });
});

describe("one-way navigation", () => {
  // The campaign may link to the English site; nothing in the English site links back.
  const CAMPAIGN_FILES = [path.join("components", "campaign"), path.join("lib", "content", "grow-your-business.ts")];

  function englishSiteSources(dir: string): string[] {
    return fs.readdirSync(path.join(SRC, dir), { withFileTypes: true }).flatMap((entry) => {
      const rel = path.join(dir, entry.name);
      if (CAMPAIGN_FILES.some((campaign) => rel.startsWith(campaign)) || rel.startsWith(path.join("app", "grow-your-business"))) {
        return [];
      }
      if (entry.isDirectory()) return englishSiteSources(rel);
      return /\.(tsx?|css)$/.test(entry.name) && !entry.name.includes(".test.") ? [path.join(SRC, rel)] : [];
    });
  }

  it("has no link to /grow-your-business anywhere in the English site", () => {
    const files = ["app", "components", "lib"].flatMap(englishSiteSources);
    expect(files.length).toBeGreaterThan(100);
    expect(files.filter((file) => fs.readFileSync(file, "utf8").includes("grow-your-business"))).toEqual([]);
  });
});
