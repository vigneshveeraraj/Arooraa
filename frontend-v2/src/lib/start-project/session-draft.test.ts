import { afterEach, describe, expect, it } from "vitest";
import { clearDraft, hasMeaningfulDraft, loadDraft, saveDraft } from "./session-draft";
import { EMPTY_FORM_VALUES } from "./types";

afterEach(() => {
  clearDraft();
});

describe("session draft persistence", () => {
  it("round-trips form values through sessionStorage", () => {
    saveDraft({ ...EMPTY_FORM_VALUES, name: "Priya", problemStatement: "A long problem description." }, 1);
    const draft = loadDraft();
    expect(draft?.values.name).toBe("Priya");
    expect(draft?.values.problemStatement).toBe("A long problem description.");
  });

  it("persists the current step as the resume location", () => {
    saveDraft({ ...EMPTY_FORM_VALUES, name: "Priya" }, 2);
    expect(loadDraft()?.currentStep).toBe(2);
  });

  it("never persists WhatsApp consent", () => {
    saveDraft({ ...EMPTY_FORM_VALUES, whatsappConsent: true }, 0);
    const raw = window.sessionStorage.getItem("arooraa:start-project:draft:v1");
    expect(raw).not.toMatch(/whatsappConsent/);
  });

  it("never persists the honeypot field", () => {
    saveDraft({ ...EMPTY_FORM_VALUES, website: "spam-bot-value" }, 0);
    const raw = window.sessionStorage.getItem("arooraa:start-project:draft:v1");
    expect(raw).not.toMatch(/spam-bot-value/);
  });

  it("clears the draft", () => {
    saveDraft({ ...EMPTY_FORM_VALUES, name: "Priya" }, 0);
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it("returns null when nothing was ever saved", () => {
    expect(loadDraft()).toBeNull();
  });
});

describe("hasMeaningfulDraft", () => {
  it("is false for a freshly-saved, entirely empty draft", () => {
    saveDraft(EMPTY_FORM_VALUES, 0);
    expect(hasMeaningfulDraft(loadDraft())).toBe(false);
  });

  it("is true once the visitor has entered something", () => {
    saveDraft({ ...EMPTY_FORM_VALUES, name: "Priya" }, 2);
    expect(hasMeaningfulDraft(loadDraft())).toBe(true);
  });

  it("is false for a null draft", () => {
    expect(hasMeaningfulDraft(null)).toBe(false);
  });
});
