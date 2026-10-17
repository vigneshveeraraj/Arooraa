import { describe, expect, it } from "vitest";
import {
  DEFAULT_WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY_NUMBER,
  WHATSAPP_MESSAGES,
  WHATSAPP_NUMBER,
  WHATSAPP_SHAREABLE_LINKS,
  WHATSAPP_TEL_HREF,
  formatWhatsAppDisplay,
  resolveWhatsAppNumber,
  whatsAppChatUrl,
  whatsAppUrlFor,
} from "./config";

describe("WhatsApp destination", () => {
  it("defaults to the official AROORAA number", () => {
    expect(DEFAULT_WHATSAPP_NUMBER).toBe("918220503447");
    expect(WHATSAPP_NUMBER).toBe("918220503447");
    expect(WHATSAPP_DISPLAY_NUMBER).toBe("+91 82205 03447");
    expect(WHATSAPP_TEL_HREF).toBe("tel:+918220503447");
  });

  it("accepts a valid build-time override and ignores anything malformed", () => {
    expect(resolveWhatsAppNumber("+91 98400 12345")).toBe("919840012345");
    expect(resolveWhatsAppNumber("15551234567")).toBe("15551234567");
    for (const bad of [undefined, "", "abc", "0123456789", "12345", "+91 98400 12345 999999", "91-98<script>"]) {
      expect(resolveWhatsAppNumber(bad)).toBe(DEFAULT_WHATSAPP_NUMBER);
    }
  });

  it("formats Indian numbers for display and others plainly", () => {
    expect(formatWhatsAppDisplay("918220503447")).toBe("+91 82205 03447");
    expect(formatWhatsAppDisplay("15551234567")).toBe("+15551234567");
  });
});

describe("click-to-chat URLs", () => {
  it("always use https://wa.me/<digits> with a percent-encoded text parameter", () => {
    const url = new URL(whatsAppUrlFor("en"));
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/918220503447");
    expect(url.searchParams.get("text")).toBe(WHATSAPP_MESSAGES.en);
    expect(whatsAppUrlFor("en")).not.toContain("+");
    expect(whatsAppUrlFor("en")).toContain("%20");
  });

  it("round-trips Tamil, ampersands, plus signs, emoji and new lines exactly", () => {
    for (const text of [WHATSAPP_MESSAGES.ta, "AI & Automation + CRM?", "வணக்கம் 👋\nAROORAA #1"]) {
      expect(new URL(whatsAppChatUrl(text)).searchParams.get("text")).toBe(text);
    }
    expect(whatsAppChatUrl("a&b=c")).toBe("https://wa.me/918220503447?text=a%26b%3Dc");
  });

  it("drops on-page word joiners and omits empty text", () => {
    expect(new URL(whatsAppChatUrl("Business⁠-ஐ")).searchParams.get("text")).toBe("Business-ஐ");
    expect(whatsAppChatUrl()).toBe("https://wa.me/918220503447");
    expect(whatsAppChatUrl("   ")).toBe("https://wa.me/918220503447");
  });

  it("never carries a phone number in the prefilled text", () => {
    for (const message of Object.values(WHATSAPP_MESSAGES)) {
      expect(message).not.toMatch(/\d{6,}/);
    }
  });

  it("prepares plain, English and Tamil links for social profiles from the same destination", () => {
    expect(WHATSAPP_SHAREABLE_LINKS.plain).toBe("https://wa.me/918220503447");
    expect(WHATSAPP_SHAREABLE_LINKS.english).toBe(whatsAppUrlFor("en"));
    expect(WHATSAPP_SHAREABLE_LINKS.tamil).toBe(whatsAppUrlFor("ta"));
  });

  it("keeps the opening messages neutral for the WhatsApp assistant (see WebsiteWhatsAppPrefillTest)", () => {
    // No service names and no request for a person: either would change what the assistant does.
    for (const message of Object.values(WHATSAPP_MESSAGES)) {
      expect(message.toLowerCase()).not.toMatch(/website|automation|marketing|software|\bapp\b|\bteam\b|person|agent|price|stop/);
    }
  });
});
