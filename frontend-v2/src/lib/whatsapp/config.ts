/**
 * The one place the website's WhatsApp destination is defined (docs/whatsapp-entry.md).
 *
 * Every WhatsApp link on the site — English pages, the Tamil campaign page, the lead form, and the
 * links prepared for social profiles — is built here, so changing the number is one edit (or one
 * build-time variable) and never a search through components.
 *
 * What a link does, and does not do: a wa.me link only OPENS a chat with the text prefilled. The
 * visitor still has to press Send, and nothing is sent by the website. Whether an automated reply
 * follows depends on the number being onboarded as a WhatsApp Cloud API sender — at the time of
 * writing the AROORAA business number is a Meta test recipient, not a verified sender, so the site
 * never claims an instant or automated reply.
 */

/** The official AROORAA number (E.164 digits, no "+"), used unless a build overrides it. */
export const DEFAULT_WHATSAPP_NUMBER = "918220503447";

const E164_DIGITS = /^[1-9]\d{7,14}$/;

/**
 * Build-time override for a sandbox or a future verified sender: NEXT_PUBLIC_WHATSAPP_NUMBER, digits
 * only (a leading "+" or spaces are tolerated). Anything that is not a plausible E.164 number is
 * ignored, so a typo can never produce a broken link on every page.
 */
export function resolveWhatsAppNumber(override: string | undefined): string {
  const digits = (override ?? "").replace(/[\s+()-]/g, "");
  return E164_DIGITS.test(digits) ? digits : DEFAULT_WHATSAPP_NUMBER;
}

export const WHATSAPP_NUMBER = resolveWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);

/** "+91 82205 03447" for the default Indian number; the plain "+digits" form otherwise. */
export function formatWhatsAppDisplay(digits: string): string {
  return /^91\d{10}$/.test(digits) ? `+91 ${digits.slice(2, 7)} ${digits.slice(7)}` : `+${digits}`;
}

export const WHATSAPP_DISPLAY_NUMBER = formatWhatsAppDisplay(WHATSAPP_NUMBER);
export const WHATSAPP_TEL_HREF = `tel:+${WHATSAPP_NUMBER}`;

export type WhatsAppLocale = "en" | "ta";

/**
 * Prefilled opening messages. Deliberately neutral, because the WhatsApp assistant reads the first
 * message: a service named in it is taken as the customer's choice (the old campaign text said
 * "website" and pre-filed every visitor as a Website enquiry), and "talk to your team" is a request
 * for a person that skips the whole conversation. The backend test
 * WebsiteWhatsAppPrefillTest keeps these exact strings neutral — change both together.
 * The conversation still opens with its usual language selection: the page language is not passed
 * on (not implemented yet).
 */
export const WHATSAPP_MESSAGES: Record<WhatsAppLocale, string> = {
  en: "Hi AROORAA, I'd like to know how you can help my business.",
  ta: "வணக்கம் AROORAA, என் வணிகத்துக்கு நீங்கள் எப்படி உதவலாம் என்று அறிய விரும்புகிறேன்.",
};

/**
 * A click-to-chat URL: https://wa.me/<digits>?text=<encoded>. The text is percent-encoded with
 * encodeURIComponent (spaces as %20, never "+", which WhatsApp would show literally). Word joiners used
 * for on-page line breaking are removed. Never put the visitor's phone number or other personal data
 * in the text — URLs end up in browser history and analytics.
 */
export function whatsAppChatUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const text = (message ?? "").replaceAll("⁠", "").trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** The standard website link in a language. */
export function whatsAppUrlFor(locale: WhatsAppLocale): string {
  return whatsAppChatUrl(WHATSAPP_MESSAGES[locale]);
}

/**
 * Ready-made destinations for places outside the website (docs/whatsapp-entry.md §Social). These are
 * ordinary click-to-chat links — paste them into a Facebook or Instagram profile button, a link-in-bio,
 * a post or a landing page. They carry no campaign attribution: the conversation cannot tell which
 * one was used. A Meta Click-to-WhatsApp *ad* is configured in Ads Manager instead and needs no URL.
 */
export const WHATSAPP_SHAREABLE_LINKS = {
  /** No prefilled text: the visitor writes their own first message. */
  plain: whatsAppChatUrl(),
  english: whatsAppUrlFor("en"),
  tamil: whatsAppUrlFor("ta"),
} as const;
