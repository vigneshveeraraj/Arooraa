import { afterEach, describe, expect, it } from "vitest";
import { captureAttribution } from "./attribution";

function setReferrer(value: string) {
  Object.defineProperty(document, "referrer", { value, configurable: true });
}

afterEach(() => {
  setReferrer("");
  window.history.replaceState({}, "", "/start-project");
});

describe("captureAttribution", () => {
  it("maps a same-origin product referrer to its source context", () => {
    setReferrer(`${window.location.origin}/products/smart-mirror`);
    const attribution = captureAttribution();
    expect(attribution.sourceContext).toBe("SMART_MIRROR");
    expect(attribution.entryRoute).toBe("/products/smart-mirror");
  });

  it("maps a same-origin service referrer to its source context", () => {
    setReferrer(`${window.location.origin}/services/ai-automation`);
    const attribution = captureAttribution();
    expect(attribution.sourceContext).toBe("AI_DATA_AUTOMATION");
  });

  it("maps an /our-work engineering-story referrer to the same product context", () => {
    setReferrer(`${window.location.origin}/our-work/smart-home`);
    const attribution = captureAttribution();
    expect(attribution.sourceContext).toBe("SMART_HOME");
  });

  it("leaves sourceContext undefined for an unknown or external referrer", () => {
    setReferrer("https://www.google.com/search?q=arooraa");
    const attribution = captureAttribution();
    expect(attribution.sourceContext).toBeUndefined();
  });

  it("leaves sourceContext undefined when there is no referrer at all", () => {
    setReferrer("");
    const attribution = captureAttribution();
    expect(attribution.sourceContext).toBeUndefined();
    expect(attribution.referrer).toBeUndefined();
  });

  it("captures UTM parameters from the current URL", () => {
    window.history.replaceState({}, "", "/start-project?utm_source=linkedin&utm_medium=social&utm_campaign=launch&utm_content=post1");
    const attribution = captureAttribution();
    expect(attribution.utmSource).toBe("linkedin");
    expect(attribution.utmMedium).toBe("social");
    expect(attribution.utmCampaign).toBe("launch");
    expect(attribution.utmContent).toBe("post1");
  });
});
