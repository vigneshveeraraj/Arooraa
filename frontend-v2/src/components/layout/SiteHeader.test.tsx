import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "./SiteHeader";
import {
  PRIMARY_NAV_LINKS,
  PRODUCT_NAV_LINKS,
  SERVICE_NAV_LINKS,
  START_PROJECT_LINK,
} from "@/lib/content/navigation";

const pathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
}));

beforeEach(() => {
  pathname.mockReturnValue("/");
});

/** The header items that open a menu, and the ones that are still plain links. */
const SECTIONS = PRIMARY_NAV_LINKS.filter((link) => link.children);
const PLAIN_LINKS = PRIMARY_NAV_LINKS.filter((link) => !link.children);

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
    for (const link of PLAIN_LINKS) {
      expect(screen.getByRole("link", { name: link.label, hidden: true })).toHaveAttribute("href", link.href);
    }
  });

  // --- section menus (A5.2.3) --------------------------------------------------------------------

  it("gives exactly Products and Services a menu, and nothing else a chevron", () => {
    // Our Work and Insights are deliberately not menus: Our Work's children are engineering
    // stories about the same four products, and Insights has one real destination. A chevron on
    // either would be decoration promising a list that does not exist.
    expect(SECTIONS.map((section) => section.label)).toEqual(["Products", "Services"]);

    render(<SiteHeader />);
    for (const section of SECTIONS) {
      expect(screen.getByRole("button", { name: section.label, hidden: true })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
    for (const link of PLAIN_LINKS) {
      expect(screen.queryByRole("button", { name: link.label, hidden: true })).not.toBeInTheDocument();
    }
  });

  it("opens the Products menu on the four real products", async () => {
    render(<SiteHeader />);

    await userEvent.click(screen.getByRole("button", { name: "Products", hidden: true }));

    expect(PRODUCT_NAV_LINKS).toHaveLength(4);
    for (const product of PRODUCT_NAV_LINKS) {
      expect(screen.getByRole("link", { name: new RegExp(`^${product.label}`), hidden: true })).toHaveAttribute(
        "href",
        product.href,
      );
      if (product.descriptor) expect(screen.getByText(product.descriptor)).toBeInTheDocument();
    }
    // The index page keeps its place in the header now that the top-level item is a button.
    expect(screen.getByRole("link", { name: /All products/, hidden: true })).toHaveAttribute(
      "href",
      "/products",
    );
  });

  it("opens the Services menu on the six real services", async () => {
    render(<SiteHeader />);

    await userEvent.click(screen.getByRole("button", { name: "Services", hidden: true }));

    expect(SERVICE_NAV_LINKS).toHaveLength(6);
    for (const service of SERVICE_NAV_LINKS) {
      expect(screen.getByRole("link", { name: service.label, hidden: true })).toHaveAttribute(
        "href",
        service.href,
      );
    }
    expect(screen.getByRole("link", { name: /All services/, hidden: true })).toHaveAttribute(
      "href",
      "/services",
    );
  });

  it("closes on a second press of the same item", async () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Products", hidden: true });

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /^MESA/, hidden: true })).not.toBeInTheDocument();
  });

  it("keeps one menu open at a time", async () => {
    render(<SiteHeader />);

    await userEvent.click(screen.getByRole("button", { name: "Products", hidden: true }));
    await userEvent.click(screen.getByRole("button", { name: "Services", hidden: true }));

    expect(screen.getByRole("button", { name: "Products", hidden: true })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Services", hidden: true })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("opens from the keyboard and closes on Escape, giving focus back to the item", async () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Products", hidden: true });

    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Left alone, focus would fall to the body and the next Tab would restart at the top of the
    // page rather than continuing along the header.
    expect(trigger).toHaveFocus();
  });

  it("opens with the space bar as well", async () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Services", hidden: true });

    trigger.focus();
    await userEvent.keyboard(" ");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes when something outside the navigation is pressed", async () => {
    render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Products", hidden: true });
    await userEvent.click(trigger);

    await userEvent.click(document.body);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the route changes", async () => {
    const { rerender } = render(<SiteHeader />);
    const trigger = screen.getByRole("button", { name: "Products", hidden: true });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // However the navigation happened — a link in the panel, or the browser's back button — the
    // panel must not be left hanging over the page that replaced the one it was opened from.
    pathname.mockReturnValue("/products/mesa");
    rerender(<SiteHeader />);

    expect(screen.getByRole("button", { name: "Products", hidden: true })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("marks the section the visitor is inside, without claiming to be the page itself", async () => {
    pathname.mockReturnValue("/products/mesa");
    render(<SiteHeader />);

    const trigger = screen.getByRole("button", { name: "Products", hidden: true });
    // aria-current belongs to a link that is the current page; this is a button that opens a menu.
    expect(trigger).not.toHaveAttribute("aria-current");
    expect(trigger.className).toMatch(/triggerActive/);
  });

  it("leaves the Start a Project CTA outside the menus entirely", async () => {
    render(<SiteHeader />);

    await userEvent.click(screen.getByRole("button", { name: "Products", hidden: true }));

    for (const cta of screen.getAllByRole("link", { name: /^start/i, hidden: true })) {
      expect(cta).toHaveAttribute("href", START_PROJECT_LINK.href);
      expect(cta.closest("[class*='panel']")).toBeNull();
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
