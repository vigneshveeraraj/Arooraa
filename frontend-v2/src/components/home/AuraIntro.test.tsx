import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuraIntro } from "./AuraIntro";
import { AURA_CTA_LABEL, AURA_EXAMPLE_PROMPTS } from "@/lib/content/aura";

describe("AuraIntro", () => {
  it("introduces Aura with conversational positioning", () => {
    render(<AuraIntro />);
    expect(screen.getByText("Aura")).toBeInTheDocument();
    expect(screen.getByText(/conversational assistant/i)).toBeInTheDocument();
  });

  it("shows the approved quick-action examples", () => {
    render(<AuraIntro />);
    for (const prompt of AURA_EXAMPLE_PROMPTS) {
      expect(screen.getByText(prompt)).toBeInTheDocument();
    }
  });

  it("does not render the static example prompts as functional buttons or links", () => {
    render(<AuraIntro />);
    for (const prompt of AURA_EXAMPLE_PROMPTS) {
      const el = screen.getByText(prompt);
      expect(el.closest("button")).toBeNull();
      expect(el.closest("a")).toBeNull();
    }
  });

  it("renders the Ask Aura CTA as a disabled, non-functional preview", () => {
    render(<AuraIntro />);
    const cta = screen.getByRole("button", { name: AURA_CTA_LABEL });
    expect(cta).toBeDisabled();
  });

  it("labels the panel as a preview so the disabled state reads as intentional", () => {
    render(<AuraIntro />);
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("does not exaggerate current AI capability", () => {
    render(<AuraIntro />);
    const text = document.body.textContent ?? "";
    const disallowed = [/revolutionary/i, /supercharge/i, /next-generation artificial intelligence/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
