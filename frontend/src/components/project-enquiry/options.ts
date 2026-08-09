import type {
  BudgetRangeOption,
  ContactMethodOption,
  ProjectTypeOption,
  ServiceTypeOption,
  TimelineOption,
} from "./types";

export const SERVICE_TYPE_OPTIONS: { value: ServiceTypeOption; label: string }[] = [
  { value: "IDEA_PRODUCT_CONSULTING", label: "Idea & Product Consulting" },
  { value: "WEBSITE_DIGITAL_PLATFORM", label: "Websites & Digital Platforms" },
  { value: "CUSTOM_SOFTWARE", label: "Custom Software Development" },
  { value: "SAAS_PRODUCT", label: "SaaS Product" },
  { value: "MOBILE_APPLICATION", label: "Mobile Application" },
  { value: "AI_AUTOMATION", label: "AI & Automation" },
  { value: "APPLICATION_MODERNIZATION", label: "Application Modernization" },
  { value: "CLOUD_DEVOPS", label: "Cloud & DevOps" },
  { value: "NOT_SURE", label: "Not sure yet — help me figure it out" },
];

export const PROJECT_TYPE_OPTIONS: { value: ProjectTypeOption; label: string }[] = [
  { value: "NEW_PRODUCT", label: "Building a new product" },
  { value: "EXISTING_SYSTEM_ENHANCEMENT", label: "Enhancing an existing system" },
  { value: "MODERNIZATION", label: "Modernizing legacy software" },
  { value: "INTEGRATION", label: "Integrating systems or tools" },
  { value: "AUTOMATION", label: "Automating a workflow" },
  { value: "CONSULTING", label: "Consulting / advisory" },
  { value: "OTHER", label: "Something else" },
];

export const BUDGET_RANGE_OPTIONS: { value: BudgetRangeOption; label: string }[] = [
  { value: "UNDER_50K", label: "Under ₹50,000" },
  { value: "FROM_50K_TO_2L", label: "₹50,000 – ₹2,00,000" },
  { value: "FROM_2L_TO_5L", label: "₹2,00,000 – ₹5,00,000" },
  { value: "FROM_5L_TO_10L", label: "₹5,00,000 – ₹10,00,000" },
  { value: "ABOVE_10L", label: "Above ₹10,00,000" },
  { value: "NEED_GUIDANCE", label: "Not sure — need guidance" },
];

export const TIMELINE_OPTIONS: { value: TimelineOption; label: string }[] = [
  { value: "ASAP", label: "As soon as possible" },
  { value: "WITHIN_1_MONTH", label: "Within 1 month" },
  { value: "FROM_1_TO_3_MONTHS", label: "1–3 months" },
  { value: "FROM_3_TO_6_MONTHS", label: "3–6 months" },
  { value: "ABOVE_6_MONTHS", label: "6+ months" },
  { value: "FLEXIBLE", label: "Flexible / not fixed yet" },
];

export const CONTACT_METHOD_OPTIONS: { value: ContactMethodOption; label: string }[] = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "VIDEO_CALL", label: "Video call" },
];
