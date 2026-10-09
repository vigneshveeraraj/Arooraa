import type { CampaignIconName } from "@/components/campaign/CampaignIcon";
import { keepSuffix } from "@/components/campaign/keepSuffix";

/**
 * Content for the Tamil Nadu campaign page, /grow-your-business.
 *
 * Content rules: no testimonials, ratings, client logos, statistics or outcome claims.
 * Everything below describes what AROORAA offers or how an engagement runs. The four
 * businesses shown in website mockups (Nilaa Homes, Maram Living, Forgeline Industries,
 * Northbridge Advisors) are fictional design concepts and are labelled as such wherever
 * they appear.
 *
 * Copy whose grammar is Tamil (with English loanwords) is rendered with lang="ta" by the
 * components; strings that join an English word to a Tamil suffix with a hyphen go
 * through keepSuffix() so the suffix can never wrap onto the next line.
 *
 * One-way navigation: this page links to the main English site, and nothing in the
 * English site links here (enforced by grow-your-business.test.tsx).
 */

export const CAMPAIGN_PATH = "/grow-your-business";

export const CAMPAIGN_CONTACT = {
  phoneE164: "+918220503447",
  phoneDisplay: "+91 82205 03447",
  email: "support@arooraa.com",
  whatsappUrl:
    "https://wa.me/918220503447?text=" +
    encodeURIComponent(
      "Hi AROORAA, I'm interested in a website or digital solution for my business. Please contact me.",
    ),
} as const;

export const CAMPAIGN_SEO = {
  title: "Business Website, AI & Automation Solutions | AROORAA",
  description:
    "Professional websites, customer enquiries, business automation and AI solutions for growing businesses across Tamil Nadu. Talk to AROORAA Technologies.",
  ogTitle: "உங்கள் Business-ஐ Digital-ஆ மாற்றலாம் | AROORAA",
  ogDescription: "Website முதல் AI & Automation வரை — உங்கள் business-க்கு தேவையான technology solutions.",
  ogImage: "/images/campaign/og-grow-your-business.jpg",
} as const;

/** Sections of this page — header, mobile menu and footer. */
export const CAMPAIGN_PAGE_LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "Website Concepts", href: "#concepts" },
  { label: "How It Works", href: "#process" },
  { label: "Industries", href: "#industries" },
] as const;

/** Live routes of the main English site (see navigation.ts). */
export const CAMPAIGN_SITE_LINKS = [
  { label: "Services", href: "/services", description: "Our full range of engineering services" },
  { label: "Products", href: "/products", description: "MESA, Mindra and our other products" },
  { label: "Our Work", href: "/our-work", description: "Product and engineering case studies" },
  { label: "Main Website", href: "/", description: "AROORAA Technologies (English)" },
] as const;

export const HERO = {
  badge: keepSuffix("Tamil Nadu business-களுக்கான Digital Solutions"),
  titleStart: keepSuffix("உங்கள் Business-ஐ"),
  titleAccent: keepSuffix("Digital-ஆ"),
  titleEnd: "மாற்றலாம்",
  lead: keepSuffix(
    "Professional Website, AI மற்றும் Automation மூலம் உங்கள் Business-க்கு அதிக Enquiries, நல்ல Customer Experience மற்றும் திறமையான Operations உருவாக்க உதவுகிறோம்.",
  ),
  whatsappLabel: keepSuffix("WhatsApp-ல் பேசலாம்"),
  conceptsLabel: "Website concepts பாருங்கள்",
  callPrompt: "அல்லது நேரடியாக அழைக்கவும்:",
  assurances: ["Business-focused approach", "Secure development", "Practical solutions"],
  caption:
    "Website concept for a fictional builder, “Nilaa Homes” — an illustrative design by AROORAA, not a client project.",
} as const;

export const SOLUTIONS = {
  eyebrow: "Our Solutions",
  title: "Website மட்டும் இல்லை — முழுமையான Digital Solutions",
  lead: "Website முதல் AI & Automation வரை, உங்கள் business-க்கு தேவையான technology solutions ஒரே இடத்தில்.",
  featured: {
    tag: "Core service",
    title: "Professional Website Development",
    description: keepSuffix(
      "Customers நம்பும் வகையில் உங்கள் business-ஐ present பண்ணும், modern மற்றும் mobile-friendly website.",
    ),
    points: [
      "Mobile-friendly, responsive design",
      "Enquiry forms and WhatsApp button",
      "Search-friendly page structure",
      "Launch and ongoing support options",
    ],
  },
  services: [
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
  ] satisfies { icon: CampaignIconName; title: string; description: string }[],
} as const;

export const CONCEPTS = {
  eyebrow: "Website Design Concepts",
  title: "உங்கள் business-க்கு இப்படி ஒரு website",
  lead: "ஒவ்வொரு business-க்கும் தனித்துவமான design. கீழே உள்ளவை AROORAA உருவாக்கிய design concepts — client projects அல்ல.",
  disclaimer: "Illustrative design concept — fictional business",
  items: [
    {
      id: "maram-living",
      type: "Furniture showroom",
      name: "Maram Living",
      description: keepSuffix(
        "Products-ஐ அழகாக காட்டும் catalogue, material மற்றும் finish விவரங்கள், ஒவ்வொரு product-லும் WhatsApp enquiry.",
      ),
      features: ["Product catalogue", "WhatsApp enquiry", "Showroom location", "Mobile-first"],
    },
    {
      id: "forgeline",
      type: "Manufacturing",
      name: "Forgeline Industries",
      description: keepSuffix(
        "Capabilities மற்றும் facility pages, drawing upload உடன் Request-a-Quote form — enquiries நேரடியாக sales team-க்கு.",
      ),
      features: ["Capabilities", "Request a quote", "Drawing upload", "Enquiry tracking"],
    },
    {
      id: "northbridge",
      type: "Professional services",
      name: "Northbridge Advisors",
      description: "நம்பிக்கை தரும் clean design, services விவரங்கள், online appointment booking மற்றும் automatic reminders.",
      features: ["Service pages", "Online booking", "Auto reminders", "Google-ready"],
    },
  ],
} as const;

export const CONTRAST = {
  today: {
    eyebrow: "Your business today",
    title: "இன்னும் இப்படித்தான் manage பண்றீங்களா?",
    items: [
      keepSuffix("Website இல்லையா அல்லது outdated-ஆ இருக்கா?"),
      "Enquiries சரியாக track ஆகுதா?",
      "Customer follow-up miss ஆகுதா?",
      "Marketing results தெரியலையா?",
      "Manual work அதிகமாக இருக்கா?",
    ],
  },
  withArooraa: {
    eyebrow: "With AROORAA",
    title: keepSuffix("உங்கள் Business-க்கு சரியான Digital Solution"),
    items: [
      "Modern, mobile-friendly website",
      "Customer enquiry capture & management",
      "Marketing and lead generation integrations",
      "AI & automation where it adds value",
      "Technical support options",
    ],
  },
} as const;

export const PROCESS = {
  eyebrow: "How It Works",
  title: "Enquiry முதல் Launch வரை",
  lead: "ஒவ்வொரு step-லும் உங்களுடன் discuss பண்ணி, தெளிவான process-ஓட வேலை செய்கிறோம்.",
  steps: [
    {
      title: "முதலில், உங்கள் தேவைகள்",
      titleLang: "ta",
      description: "Customers, goals, இப்போதைய process — எல்லாவற்றையும் முதலில் discuss பண்ணுவோம்.",
    },
    {
      title: "Design & Develop",
      titleLang: "en",
      description: keepSuffix("உங்கள் தேவைக்கும் budget-க்கும் ஏற்ற solution-ஐ propose பண்ணி build பண்ணுவோம்."),
    },
    {
      title: "தேவையான இடத்தில் Integrate",
      titleLang: "ta",
      description: "Enquiry handling, AI மற்றும் automation வாய்ப்புகளை assess பண்ணுவோம்.",
    },
    {
      title: "Launch & Improve",
      titleLang: "en",
      description: "Test பண்ணி launch செய்து, support மற்றும் future improvements பற்றி பேசுவோம்.",
    },
  ],
} as const;

export const INDUSTRIES = {
  eyebrow: "For Businesses Like Yours",
  title: "உங்கள் Business-க்கு ஏற்றபடி",
  lead: "இவை சில உதாரணங்கள் மட்டுமே — உங்கள் business எதுவாக இருந்தாலும் பேசலாம்.",
  items: [
    { icon: "store", name: "Retail & Showrooms", description: "Product showcases, enquiries and store information" },
    { icon: "factory", name: "Manufacturing", description: "Company profiles, catalogues and distributor enquiries" },
    { icon: "building", name: "Construction & Interiors", description: "Project portfolios and consultation enquiries" },
    { icon: "health", name: "Healthcare & Clinics", description: "Services, location and appointment enquiries" },
    { icon: "education", name: "Education & Training", description: "Course information and admissions enquiries" },
    { icon: "coffee", name: "Restaurants & Cafés", description: "Digital presence, menus and customer enquiries" },
  ] satisfies { icon: CampaignIconName; name: string; description: string }[],
} as const;

export const WHY_AROORAA = {
  eyebrow: "Why AROORAA",
  title: "Website மட்டும் இல்லை, ஒரு Technology Partner",
  values: [
    {
      icon: "target",
      title: "Business-focused",
      description: keepSuffix("Technology-ஐ suggest பண்ணுவதற்கு முன், உங்கள் problem-ஐ புரிந்துகொள்கிறோம்."),
    },
    { icon: "code", title: "Modern engineering", description: "Responsive design, performance மற்றும் maintainable code." },
    {
      icon: "sliders",
      title: "Tailored delivery",
      description: keepSuffix("தேவையில்லாத complexity இல்லாமல், உங்கள் business-க்கு சரியான scope."),
    },
    { icon: "sprout", title: "Long-term thinking", description: "உங்கள் business வளரும்போது, கூடவே வளரக்கூடிய foundation." },
  ] satisfies { icon: CampaignIconName; title: string; description: string }[],
} as const;

export const CONTACT_SECTION = {
  eyebrow: "Free Consultation",
  title: keepSuffix("உங்கள் Business-க்கு அடுத்த step எடுக்கலாமா?"),
  lead: keepSuffix(
    "உங்கள் requirements பற்றி பேசலாம். Website, AI அல்லது Automation — உங்கள் Business-க்கு பொருத்தமான approach-ஐ கண்டுபிடிப்போம்.",
  ),
} as const;

export const FOOTER = {
  tagline: keepSuffix("Tamil Nadu முழுவதும் உள்ள business-களுக்கு websites, AI மற்றும் automation."),
  conceptsNote: "Website concepts on this page are illustrative designs for fictional businesses, not client projects.",
} as const;
