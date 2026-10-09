import type { IconName } from "./Icon";
import { keepSuffix } from "./keepSuffix";

/**
 * Campaign copy and contact details for /grow-your-business.
 *
 * Content rules for this page: no testimonials, ratings, client logos, statistics or
 * outcome claims. Every service, industry and step here describes what AROORAA offers
 * or how an engagement runs — never a result it has achieved for someone.
 *
 * `lang: "ta"` marks copy whose grammar is Tamil (with English loanwords), so screen
 * readers and browsers pick Tamil pronunciation and shaping; everything else inherits
 * the document's English.
 */

export const CONTACT = {
  phoneE164: "+918220503447",
  phoneDisplay: "+91 82205 03447",
  email: "support@arooraa.com",
  whatsappUrl:
    "https://wa.me/918220503447?text=" +
    encodeURIComponent(
      "Hi AROORAA, I'm interested in a website or digital solution for my business. Please contact me.",
    ),
} as const;

/** Sections of this page, used by the header, mobile menu and footer. */
export const PAGE_LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "How It Works", href: "#process" },
  { label: "Industries", href: "#industries" },
  { label: "Why AROORAA", href: "#why-arooraa" },
] as const;

/**
 * Existing pages and sections of the main English site. Each target was checked against
 * the English site: /services is a route, #mesa is the MESA product section and #work is
 * the "Our work" section of the home page. The English site never links back here.
 *
 * Links to these use `<Link prefetch={false}>`: the static export's prefetch payloads
 * don't resolve under the production Nginx try_files rule, so prefetching only produces
 * 404s in the console. Navigation itself works either way.
 */
export const SITE_LINKS = [
  {
    label: "Services",
    href: "/services",
    icon: "layers",
    description: "AROORAA's full range of software engineering services.",
  },
  {
    label: "Products",
    href: "/#mesa",
    icon: "appWindow",
    description: "MESA — AROORAA's own restaurant operating platform.",
  },
  {
    label: "Portfolio",
    href: "/#work",
    icon: "code",
    description: "Our work across AI, automation and product engineering.",
  },
  {
    label: "Main Website",
    href: "/",
    icon: "globe",
    description: "Visit the AROORAA Technologies English website.",
  },
] as const satisfies readonly { label: string; href: string; icon: IconName; description: string }[];

export const FEATURED_SERVICE = {
  icon: "monitor",
  title: "Professional Website Development",
  description:
    keepSuffix("Customers நம்பும் வகையில் உங்கள் business-ஐ present பண்ணும், modern மற்றும் mobile-friendly website."),
  points: [
    "Mobile-friendly, responsive design",
    "Enquiry forms and WhatsApp button",
    "Search-friendly page structure",
    "Launch and ongoing support options",
  ],
} as const satisfies { icon: IconName; title: string; description: string; points: readonly string[] };

export const SERVICES = [
  {
    icon: "message",
    title: "Customer Enquiries",
    description: "Customers உங்களை எளிதாக contact பண்ண — enquiry forms, WhatsApp மற்றும் call buttons.",
  },
  {
    icon: "sparkles",
    title: "AI & Automation",
    description: "திரும்பத் திரும்ப செய்யும் வேலைகளுக்கு practical automation — பயன் தரும் இடத்தில் மட்டும்.",
  },
  {
    icon: "megaphone",
    title: "Marketing & Leads",
    description: keepSuffix("உங்கள் website-ஐ marketing efforts-உடன் இணைத்து, வரும் leads-ஐ track பண்ணலாம்."),
  },
  {
    icon: "appWindow",
    title: "Business Applications",
    description: keepSuffix("உங்கள் business process-க்கு ஏற்ற custom tools மற்றும் integrations."),
  },
  {
    icon: "headset",
    title: "Technical Support",
    description: keepSuffix("Launch-க்கு பிறகும் maintenance மற்றும் support options பற்றி பேசலாம்."),
  },
] as const satisfies readonly { icon: IconName; title: string; description: string }[];

export const TODAY_PROBLEMS = [
  keepSuffix("Website இல்லையா அல்லது outdated-ஆ இருக்கா?"),
  "Enquiries சரியாக track ஆகுதா?",
  "Customer follow-up miss ஆகுதா?",
  "Marketing results தெரியலையா?",
  "Manual work அதிகமாக இருக்கா?",
] as const;

export const WITH_AROORAA = [
  "Modern, mobile-friendly website",
  "Customer enquiry capture & management",
  "Marketing and lead generation integrations",
  "AI & automation where it adds value",
  "Technical support options",
] as const;

export const STEPS = [
  {
    title: "முதலில், உங்கள் தேவைகள்",
    description: "Customers, goals, இப்போதைய process — எல்லாவற்றையும் முதலில் discuss பண்ணுவோம்.",
  },
  {
    title: "Design & Develop",
    description: keepSuffix("உங்கள் தேவைக்கும் budget-க்கும் ஏற்ற solution-ஐ propose பண்ணி build பண்ணுவோம்."),
  },
  {
    title: "தேவையான இடத்தில் Integrate",
    description: "Enquiry handling, AI மற்றும் automation வாய்ப்புகளை assess பண்ணுவோம்.",
  },
  {
    title: "Launch & Improve",
    description: "Test பண்ணி launch செய்து, support மற்றும் future improvements பற்றி பேசுவோம்.",
  },
] as const;

export const INDUSTRIES = [
  { icon: "store", name: "Retail & Showrooms", description: "Product showcases, enquiries and store information" },
  { icon: "factory", name: "Manufacturing", description: "Company profiles, catalogues and distributor enquiries" },
  { icon: "building", name: "Construction & Interiors", description: "Project portfolios and consultation enquiries" },
  { icon: "health", name: "Healthcare & Clinics", description: "Services, location and appointment enquiries" },
  { icon: "education", name: "Education & Training", description: "Course information and admissions enquiries" },
  { icon: "coffee", name: "Restaurants & Cafés", description: "Digital presence, menus and customer enquiries" },
] as const satisfies readonly { icon: IconName; name: string; description: string }[];

export const VALUES = [
  {
    icon: "target",
    title: "Business-focused",
    description: keepSuffix("Technology-ஐ suggest பண்ணுவதற்கு முன், உங்கள் problem-ஐ புரிந்துகொள்கிறோம்."),
  },
  {
    icon: "code",
    title: "Modern engineering",
    description: "Responsive design, performance மற்றும் maintainable code.",
  },
  {
    icon: "sliders",
    title: "Tailored delivery",
    description: keepSuffix("தேவையில்லாத complexity இல்லாமல், உங்கள் business-க்கு சரியான scope."),
  },
  {
    icon: "sprout",
    title: "Long-term thinking",
    description: "உங்கள் business வளரும்போது, கூடவே வளரக்கூடிய foundation.",
  },
] as const satisfies readonly { icon: IconName; title: string; description: string }[];

/** The journey the hero illustration shows, after the website itself. */
export const GROWTH_FLOW = [
  { icon: "message", label: "Enquiries", detail: "WhatsApp & forms" },
  { icon: "sparkles", label: "AI & Automation", detail: "Replies & follow-ups" },
  { icon: "megaphone", label: "Marketing", detail: "Google & social" },
  { icon: "trendingUp", label: "Growth", detail: "More visibility" },
] as const satisfies readonly { icon: IconName; label: string; detail: string }[];
