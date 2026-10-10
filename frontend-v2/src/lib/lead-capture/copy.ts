import { keepSuffix } from "@/components/campaign/keepSuffix";
import type { LeadLocale, LeadRequirement } from "./types";

/**
 * Every visible string of the lead form, in both languages. Tamil copy follows the campaign's
 * Tamil-with-English-loanwords style; every Tamil string is run through keepSuffix() below so an
 * English word's Tamil suffix never wraps onto the next line. No string here may mention a price — pricing is discussed only after
 * the team understands the requirement.
 */
export interface LeadCopy {
  title: string;
  intro: string;
  /** Shown instead of `intro` while lead capture is not connected — nothing promises a call back. */
  introDirect: string;
  requirementLegend: string;
  requirements: Record<LeadRequirement, string>;
  phoneLabel: string;
  phoneHint: string;
  consentLabel: string;
  submit: string;
  submitting: string;
  errors: { requirement: string; phone: string; consent: string };
  failure: Record<"network" | "rate_limited" | "rejected" | "unavailable", string>;
  notSaved: string;
  fallbackWhatsApp: string;
  fallbackCall: string;
  unavailableNotice: string;
  success: { title: string; body: string; reference: string; continueWhatsApp: string; sendNote: string };
  whatsappMessage: {
    generic: string;
    withRequirement: (requirement: string) => string;
    reference: (reference: string) => string;
  };
}

const en: LeadCopy = {
  title: "Get a Free Consultation",
  intro: "Two quick steps. No name, email or budget needed — our team will call or WhatsApp you.",
  introDirect: "Tell us what you need, then talk to our team directly on WhatsApp or by phone.",
  requirementLegend: "What do you need help with?",
  requirements: {
    WEBSITE: "A new website or a website redesign",
    CUSTOMER_ENQUIRIES: "Customer enquiries & WhatsApp",
    AI_AUTOMATION: "AI & automation",
    MARKETING_LEADS: "Marketing & leads",
    BUSINESS_APPLICATION: "A business application",
    NOT_SURE: "Not sure yet — I'd like advice",
  },
  phoneLabel: "Your mobile number",
  phoneHint: "10-digit Indian mobile number.",
  consentLabel: "I agree that AROORAA may contact me on this number by phone or WhatsApp about this enquiry.",
  submit: "Get a Free Consultation",
  submitting: "Saving your request…",
  errors: {
    requirement: "Choose what you need help with.",
    phone: "Enter a valid 10-digit Indian mobile number.",
    consent: "Tick the box so we can contact you about this enquiry.",
  },
  failure: {
    network: "We couldn't reach AROORAA. Check your connection and try again.",
    rate_limited: "You've sent a few requests in a short time. Please wait a few minutes and try again.",
    rejected: "We couldn't accept these details. Please check them and try again.",
    unavailable: "Online requests aren't available right now.",
  },
  notSaved: "Your details have not been saved.",
  fallbackWhatsApp: "Message us on WhatsApp instead",
  fallbackCall: "Or call",
  unavailableNotice:
    "Online requests aren't available right now, so we can't save your details here. Talk to our team directly instead:",
  success: {
    title: "Thank you — your request is saved.",
    body: "Our team will contact you soon. Want to talk now? Continue on WhatsApp.",
    reference: "Your reference",
    continueWhatsApp: "Continue on WhatsApp",
    sendNote: "WhatsApp opens with a message ready — press send to start the chat.",
  },
  whatsappMessage: {
    generic: "Hi AROORAA, I'd like a free consultation for my business.",
    withRequirement: (requirement) => `Hi AROORAA, I'd like a free consultation about: ${requirement}.`,
    reference: (reference) => `Reference: ${reference}`,
  },
};

const ta: LeadCopy = {
  title: "Get a Free Consultation",
  intro: "இரண்டே steps. பெயர், email, budget எதுவும் தேவையில்லை — எங்கள் team உங்களை call அல்லது WhatsApp செய்யும்.",
  introDirect: "உங்களுக்கு என்ன தேவை என்று தேர்வு செய்யுங்கள், பிறகு WhatsApp அல்லது phone மூலம் எங்கள் team-உடன் நேரடியாக பேசலாம்.",
  requirementLegend: "உங்களுக்கு என்ன தேவை?",
  requirements: {
    WEBSITE: "புதிய Website அல்லது Website redesign",
    CUSTOMER_ENQUIRIES: "Customer enquiries & WhatsApp",
    AI_AUTOMATION: "AI & Automation",
    MARKETING_LEADS: "Marketing & Leads",
    BUSINESS_APPLICATION: "Business Application",
    NOT_SURE: "இன்னும் உறுதியாக தெரியவில்லை — ஆலோசனை வேண்டும்",
  },
  phoneLabel: "உங்கள் Mobile number",
  phoneHint: "10 இலக்க Indian mobile number.",
  consentLabel: "இந்த enquiry தொடர்பாக AROORAA என்னை இந்த number-ல் phone அல்லது WhatsApp மூலம் தொடர்பு கொள்ள ஒப்புக்கொள்கிறேன்.",
  submit: "Get a Free Consultation",
  submitting: "உங்கள் request சேமிக்கப்படுகிறது…",
  errors: {
    requirement: "உங்களுக்கு என்ன தேவை என்று ஒன்றை தேர்வு செய்யுங்கள்.",
    phone: "சரியான 10 இலக்க Indian mobile number உள்ளிடுங்கள்.",
    consent: "உங்களை தொடர்பு கொள்ள, ஒப்புதல் box-ஐ tick செய்யுங்கள்.",
  },
  failure: {
    network: "AROORAA-ஐ தொடர்பு கொள்ள முடியவில்லை. Connection-ஐ சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    rate_limited: "குறுகிய நேரத்தில் பல requests அனுப்பியுள்ளீர்கள். சில நிமிடங்கள் கழித்து முயற்சிக்கவும்.",
    rejected: "இந்த details-ஐ ஏற்க முடியவில்லை. சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    unavailable: "Online requests இப்போது கிடைக்கவில்லை.",
  },
  notSaved: "உங்கள் details சேமிக்கப்படவில்லை.",
  fallbackWhatsApp: "WhatsApp-ல் நேரடியாக பேசலாம்",
  fallbackCall: "அல்லது call செய்யுங்கள்",
  unavailableNotice:
    "Online requests இப்போது கிடைக்கவில்லை, அதனால் உங்கள் details-ஐ இங்கே சேமிக்க முடியாது. எங்கள் team-உடன் நேரடியாக பேசலாம்:",
  success: {
    title: "நன்றி — உங்கள் request சேமிக்கப்பட்டது.",
    body: "எங்கள் team விரைவில் உங்களை தொடர்பு கொள்ளும். இப்போதே பேச வேண்டுமா? WhatsApp-ல் தொடரலாம்.",
    reference: "உங்கள் reference",
    continueWhatsApp: "Continue on WhatsApp",
    sendNote: "WhatsApp-ல் message தயாராக திறக்கும் — chat தொடங்க send அழுத்துங்கள்.",
  },
  whatsappMessage: {
    generic: "வணக்கம் AROORAA, என் business-க்கு free consultation வேண்டும்.",
    withRequirement: (requirement) => `வணக்கம் AROORAA, ${requirement} பற்றி free consultation வேண்டும்.`,
    reference: (reference) => `Reference: ${reference}`,
  },
};

function joinSuffixes(copy: LeadCopy): LeadCopy {
  const walk = (value: unknown): unknown => {
    if (typeof value === "string") return keepSuffix(value);
    if (typeof value === "function" || value === null || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, walk(inner)]));
  };
  return walk(copy) as LeadCopy;
}

export const LEAD_COPY: Record<LeadLocale, LeadCopy> = { en, ta: joinSuffixes(ta) };
