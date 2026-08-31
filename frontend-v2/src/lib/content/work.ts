export interface WorkSectionHeading {
  eyebrow: string;
  title: string;
  description: string;
}

export const FEATURED_WORK_HEADING: WorkSectionHeading = {
  eyebrow: "Our Work",
  title: "Built by AROORAA",
  description:
    "We build our own products, so we understand the journey from an idea to a system running in the real world.",
};

export interface MesaFeature {
  name: string;
  positioning: string;
  problemStatement: string;
  systemAreas: string[];
  flowSteps: string[];
  engineeringHeading: string;
  engineeringProof: string[];
  cta: { label: string; href: string };
}

/**
 * Homepage-level MESA proof. System areas, flow steps and engineering proof
 * are all verified, non-fabricated — no customer/restaurant counts, revenue,
 * uptime or efficiency numbers anywhere here (M3C brief §12).
 */
export const MESA_FEATURE: MesaFeature = {
  name: "MESA",
  positioning: "Restaurant technology ecosystem",
  problemStatement:
    "MESA is a restaurant technology ecosystem — dine-in, ordering, kitchen and staff operations running together in real time, not a collection of disconnected tools bolted onto a QR code menu.",
  systemAreas: [
    "Dine-In",
    "Ordering",
    "POS",
    "Kitchen / KDS",
    "Staff Operations",
    "Billing",
    "Real-Time Interactions",
    "Restaurant Intelligence",
  ],
  flowSteps: ["Guest", "Table / Menu", "Order", "Kitchen", "Staff", "Billing", "Restaurant Intelligence"],
  engineeringHeading: "Engineering behind MESA",
  engineeringProof: [
    "Multi-Tenant SaaS",
    "Java / Spring",
    "PostgreSQL",
    "Redis",
    "Real-Time WebSockets",
    "Docker Deployment",
  ],
  cta: { label: "Explore MESA", href: "/products/mesa" },
};

export interface SupportingWorkItem {
  id: string;
  name: string;
  challenge: string;
  proofPoints: string[];
  href: string;
}

/**
 * Emphasizes the engineering/product challenge behind each product instead
 * of repeating ProductsSnapshot's positioning copy (M3C brief §11). Marion is
 * not an AROORAA product (portfolio-correction milestone) and stays absent
 * here. Smart Home EB is a real product but has no verified engineering
 * detail yet, so it's also absent — Featured Work is proof, not a compulsory
 * product directory (portfolio-correction brief §10).
 */
export const SUPPORTING_WORK: SupportingWorkItem[] = [
  {
    id: "mindra",
    name: "Mindra",
    challenge:
      "The engineering challenge: keep a family's information, plans and reminders reliably in sync across people and devices, not just stored in one place.",
    proofPoints: [
      "Personal & Family Second Brain",
      "Mobile + Backend System",
      "Shared Information Model",
      "Planning & Reminders",
    ],
    href: "/products/mindra",
  },
  {
    id: "smart-mirror",
    name: "Smart Mirror",
    challenge:
      "The engineering challenge: run a real-time, voice-driven AI experience on embedded hardware inside an everyday mirror.",
    proofPoints: [
      "Custom Mirror Hardware",
      "Raspberry Pi / Connected Environment",
      "Voice Interaction",
      "AI / Edge Experimentation",
    ],
    href: "/products/smart-mirror",
  },
];
