import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fs from "node:fs";
import path from "node:path";
import { WhatsAppFloatingButton, WhatsAppLink } from "./WhatsAppLink";
import { whatsAppUrlFor } from "@/lib/whatsapp/config";

describe("WhatsAppLink", () => {
  it("opens the configured chat in a new tab, safely, with an accessible name", () => {
    render(<WhatsAppLink label="Chat on WhatsApp" />);
    const link = screen.getByRole("link", { name: "Chat on WhatsApp (opens WhatsApp in a new tab)" });
    expect(link).toHaveAttribute("href", whatsAppUrlFor("en"));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses the Tamil message and hint for the Tamil site", () => {
    render(<WhatsAppLink label="WhatsApp-இல் பேசுங்கள்" locale="ta" />);
    const link = screen.getByRole("link", { name: /WhatsApp புதிய தாவலில் திறக்கும்/ });
    expect(link).toHaveAttribute("href", whatsAppUrlFor("ta"));
  });

  it("is reachable and operable from the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">before</button>
        <WhatsAppLink label="Chat on WhatsApp" appearance="button" />
      </>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole("link", { name: /Chat on WhatsApp/ })).toHaveFocus();
  });

  it("the floating button has a label even though it shows only the glyph", () => {
    render(<WhatsAppFloatingButton />);
    const link = screen.getByRole("link", { name: "Chat with AROORAA on WhatsApp (opens in a new tab)" });
    expect(link).toHaveAttribute("href", whatsAppUrlFor("en"));
    expect(link).toHaveAttribute("data-whatsapp-cta", "floating");
    expect(link.textContent).toBe("");
  });

  it("styles keep the floating button mobile-only, bottom-left, under the menu and the Aura panel", () => {
    const css = fs.readFileSync(path.join(__dirname, "WhatsAppLink.module.css"), "utf8");
    const floating = css.slice(css.indexOf(".floating {"), css.indexOf("}", css.indexOf(".floating {")));
    expect(floating).toContain("position: fixed");
    expect(floating).toContain("inset-inline-start");
    expect(floating).not.toContain("inset-inline-end");
    expect(floating).toMatch(/z-index: 45;/);
    expect(floating).toContain("env(safe-area-inset-bottom");
    expect(floating).toMatch(/inline-size: 56px/);
    expect(css).toMatch(/@media \(min-width: 1120px\) \{\s*\.floating \{\s*display: none;/);
    // The Aura launcher sits bottom-right; the mobile drawer is z-index 50.
    const aura = fs.readFileSync(path.join(__dirname, "..", "aura", "AuraLauncher.module.css"), "utf8");
    expect(aura).toContain("inset-inline-end");
    const drawer = fs.readFileSync(path.join(__dirname, "..", "layout", "MobileNav.module.css"), "utf8");
    expect(Number(/z-index: (\d+)/.exec(drawer)![1])).toBeGreaterThan(45);
  });
});
