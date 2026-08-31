/**
 * W3.4 — Contact at AROORAA. All editorial copy lives here, separate from the components in
 * components/contact/, matching the content/visual split used throughout the rest of the site.
 */

export const CONTACT_HERO = {
  eyebrow: "CONTACT",
  headline: "Let's start a conversation.",
  supporting:
    "Whether you have a question about AROORAA, one of our products, a partnership, or something else, tell us what you need.",
};

export const START_PROJECT_REDIRECT = {
  title: "Have a product or engineering problem?",
  body: "If you're looking for AROORAA to help build, improve or solve something, Start a Project is the fastest way to get the right conversation going.",
  cta: { label: "Start a Project", href: "/start-project" },
};

export interface ContactInfoItem {
  title: string;
  body: string;
}

export const CONTACT_INFO_CONTENT = {
  eyebrow: "WHAT THIS IS FOR",
  title: "How we can help",
  items: [
    {
      title: "General enquiries",
      body: "Questions about AROORAA as a company, or anything that doesn't fit neatly elsewhere.",
    },
    {
      title: "Partnerships",
      body: "Exploring a partnership, collaboration or integration with AROORAA.",
    },
    {
      title: "Product questions",
      body: "Questions about MESA, Mindra, Smart Mirror or Arooraa Smart Home.",
    },
    {
      title: "Media & business enquiries",
      body: "Press, media requests, and other business conversations.",
    },
  ] as ContactInfoItem[],
};

export const CAREERS_ROUTING_CONTENT = {
  title: "Looking for an open role?",
  body: "Careers questions and applications go through our Careers page, not this form.",
  cta: { label: "View Careers", href: "/careers" },
};

export const CONTACT_FORM_CONTENT = {
  fields: {
    name: "Name",
    email: "Email address",
    phone: "Phone (optional)",
    company: "Company (optional)",
    reason: "What's this about?",
    reasonPlaceholder: "Choose a reason",
    product: "Which product? (optional)",
    productPlaceholder: "Choose a product",
    message: "Message",
    messageHelper: "Up to 2000 characters.",
  },
  submitLabel: "Send message",
  submittingLabel: "Sending…",
};

export const CONTACT_SUCCESS_CONTENT = {
  heading: "Message received.",
  referenceLabel: "Reference",
  whatsNextTitle: "What happens next",
  whatsNextBody: "Our team will review your message and get back to you.",
  backHomeCta: { label: "Back to AROORAA", href: "/" },
  startProjectCta: { label: "Start a Project", href: "/start-project" },
};
