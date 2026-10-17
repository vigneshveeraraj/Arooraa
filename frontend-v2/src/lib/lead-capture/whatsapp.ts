import { WHATSAPP_NUMBER, whatsAppChatUrl } from "@/lib/whatsapp/config";
import { LEAD_COPY } from "./copy";
import type { LeadLocale, LeadRequirement } from "./types";

/** AROORAA's WhatsApp number — defined once in lib/whatsapp/config.ts. */
export const AROORAA_WHATSAPP_NUMBER = WHATSAPP_NUMBER;

/**
 * A click-to-chat link with a prefilled message. wa.me only opens the chat — the visitor still
 * has to press send, and nothing replies automatically until the WhatsApp Cloud API is set up
 * (see frontend-v2/docs/lead-capture.md).
 *
 * The message never contains the visitor's phone number: WhatsApp already knows who is writing,
 * and URLs end up in history and logs. A saved lead is identified only by the backend's opaque
 * reference.
 */
export function leadWhatsAppUrl({
  locale,
  requirement,
  leadReference,
}: {
  locale: LeadLocale;
  requirement?: LeadRequirement;
  leadReference?: string;
}): string {
  const copy = LEAD_COPY[locale].whatsappMessage;
  const parts = [requirement ? copy.withRequirement(LEAD_COPY[locale].requirements[requirement]) : copy.generic];
  if (leadReference) parts.push(copy.reference(leadReference));
  // whatsAppChatUrl drops the word joiners keepSuffix() adds for on-page line breaking.
  return whatsAppChatUrl(parts.join(" "));
}
