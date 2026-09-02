import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SPEAK_ANSWERS_DEFAULT,
  readSpeakAnswersPreference,
  storeSpeakAnswersPreference,
} from "./preference";

describe("the spoken-answers preference", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("is off until a visitor asks for it", () => {
    // Sound that starts on its own is the most intrusive thing a website can do, so silence is
    // the default and stays the default for anyone who never touches the control.
    expect(SPEAK_ANSWERS_DEFAULT).toBe(false);
    expect(readSpeakAnswersPreference()).toBe(false);
  });

  it("remembers the choice in this browser", () => {
    storeSpeakAnswersPreference(true);
    expect(readSpeakAnswersPreference()).toBe(true);

    storeSpeakAnswersPreference(false);
    expect(readSpeakAnswersPreference()).toBe(false);
  });

  it("falls back to the default rather than throwing when storage is blocked", () => {
    // A browser with site data blocked throws on the first read. Voice refusing to work because
    // of that would be a far worse failure than a preference that resets.
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("site data blocked");
    });

    expect(readSpeakAnswersPreference()).toBe(SPEAK_ANSWERS_DEFAULT);
  });

  it("survives a browser that refuses to store it", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    expect(() => storeSpeakAnswersPreference(true)).not.toThrow();
  });

  it("ignores a stored value that is not a preference", () => {
    window.localStorage.setItem("arooraa.aura.speakAnswers", "yes-please");
    expect(readSpeakAnswersPreference()).toBe(SPEAK_ANSWERS_DEFAULT);
  });
});
