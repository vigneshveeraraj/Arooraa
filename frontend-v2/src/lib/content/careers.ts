/**
 * W3.3A — Careers at AROORAA. All editorial copy lives here, separate from
 * the bespoke components in components/careers/ (matching the content/visual
 * split used throughout /about and /our-work). Job data itself lives in
 * lib/careers/jobs.ts, not here.
 */

export const CAREERS_HERO = {
  eyebrow: "CAREERS AT AROORAA",
  headline: "Build what should exist next.",
  supporting:
    "AROORAA brings together product thinking, engineering, AI, design and business understanding to turn real-world problems into useful digital products. We're building our team around people who want to think deeply, learn continuously and create work that has visible purpose.",
  primaryCta: { label: "View Open Roles", href: "#open-roles" },
  secondaryCta: { label: "How We Work", href: "#how-we-work" },
};

export const CAREERS_IN_PAGE_NAV = [
  { label: "Open Roles", href: "#open-roles" },
  { label: "Teams", href: "#career-families" },
  { label: "Life at AROORAA", href: "#why-arooraa" },
  { label: "Hiring Process", href: "#hiring-process" },
  { label: "Job Alerts", href: "#talent-community" },
];

export const JOB_SEARCH_CONTENT = {
  heading: "Find your next opportunity",
  searchLabel: "Search by role, skill or keyword",
  searchPlaceholder: "Search by role, skill or keyword",
  teamFilterLabel: "Team",
  allTeamsLabel: "All Teams",
  noResults: {
    heading: "No roles match those filters right now.",
    body: "Try a different keyword or team, or explore the career paths we're building toward below.",
    clearLabel: "Clear filters",
    alertsLabel: "Get Job Alerts",
  },
  noOpenRoles: {
    heading: "There are no open roles published right now.",
    body: "AROORAA is preparing to open its first roles. Explore the career paths below to see what we're building toward, or join the talent community to hear the moment a role opens.",
    plannedRolesLabel: "See planned roles",
    alertsLabel: "Get Job Alerts",
  },
};

export const CAREER_FAMILIES_HEADING = {
  eyebrow: "TEAMS",
  title: "Find where you can make an impact",
};

export const CURRENT_OPENINGS_HEADING = {
  eyebrow: "OPEN ROLES",
  title: "Current openings",
  description: "Find a role where your experience, curiosity and way of thinking can contribute to what we're building.",
};

export const PLANNED_ROLES_CONTENT = {
  eyebrow: "WHAT'S NEXT",
  title: "Career paths we're building toward",
  description:
    "These aren't open positions yet. We're sharing them so you can see the kind of roles AROORAA is planning to hire for, and join Job Alerts to hear first when one opens.",
  statusLabel: "Planned — not yet open",
  cardCta: "Learn about this role",
};

export interface CareersReason {
  title: string;
  body: string;
}

export const WHY_AROORAA_CONTENT = {
  eyebrow: "WHY AROORAA",
  title: "Why build your career at AROORAA?",
  reasons: [
    {
      title: "Build Real Products",
      body: "Work on products AROORAA is actively creating — not internal tools or hypothetical roadmaps.",
    },
    {
      title: "Stay Close to the Problem",
      body: "Understand why something needs to exist before deciding how to build it.",
    },
    {
      title: "Own Meaningful Work",
      body: "See the effect of the decisions you make, whether they're engineering, design or business decisions.",
    },
    {
      title: "Learn Across Disciplines",
      body: "Product, engineering, AI, design, cloud and customer context intersect here, not siloed.",
    },
    {
      title: "Build for the Long Term",
      body: "We prefer maintainable systems over temporary demos.",
    },
    {
      title: "Use AI With Purpose",
      body: "AI is a tool for solving useful problems, not a decorative feature added because it's fashionable.",
    },
  ] as CareersReason[],
};

export const PRODUCTS_EXPOSURE_CONTENT = {
  eyebrow: "WHAT WE BUILD",
  title: "Products you may work on",
  description:
    "AROORAA is building across several product directions. The exact product or initiative depends on the role and current priorities — benefits and working arrangements vary by role and will be discussed during the hiring process.",
};

export interface WorkingPrinciple {
  title: string;
  body: string;
}

export const WORKING_PRINCIPLES_CONTENT = {
  eyebrow: "HOW WE WORK",
  title: "How we want to work",
  description: "These are the principles guiding how we want to build AROORAA — not a claim that we always get them right.",
  principles: [
    { title: "Understand before building", body: "Know the problem." },
    { title: "Reduce unnecessary complexity", body: "Technology should make work easier." },
    { title: "Quality is everyone's concern", body: "Not a final QA phase." },
    { title: "Learn openly", body: "Discuss what worked and what didn't." },
    { title: "AI with purpose", body: "Use AI because it improves a product or workflow, not because it is fashionable." },
    { title: "Respect the user", body: "Never lose sight of the person using what we build." },
    { title: "Build for change", body: "Products will evolve." },
  ] as WorkingPrinciple[],
};

export interface HiringStep {
  number: string;
  title: string;
  body: string;
}

export const HIRING_PROCESS_CONTENT = {
  eyebrow: "WHAT TO EXPECT",
  title: "What to expect",
  description: "The exact process may vary by role, but we'll explain what to expect before each stage.",
  steps: [
    { number: "1", title: "Apply", body: "Submit your profile for a specific opening." },
    { number: "2", title: "Initial conversation", body: "We understand experience, interests and role fit." },
    {
      number: "3",
      title: "Skill / role discussion",
      body: "Technical, design, marketing or sales discussion depending on the role.",
    },
    {
      number: "4",
      title: "Practical evaluation",
      body: "Where appropriate, a focused exercise, portfolio discussion or technical problem.",
    },
    {
      number: "5",
      title: "Final conversation",
      body: "Discuss role expectations, working approach and mutual fit.",
    },
    { number: "6", title: "Decision", body: "You receive the hiring outcome." },
  ] as HiringStep[],
  candidateRespect: {
    title: "Interviews should help both sides make a decision.",
    body: "AROORAA evaluates candidates, but candidates should also have enough context to decide whether AROORAA is the right place for them.",
  },
};

export interface CandidateGuideItem {
  id: string;
  title: string;
  body: string;
}

export const CANDIDATE_RESOURCES_CONTENT = {
  eyebrow: "CANDIDATE GUIDE",
  title: "Getting ready to talk with us",
  items: [
    {
      id: "engineering-discussion",
      title: "Preparing for an engineering discussion",
      body: "Engineering conversations focus on how you think, not just what you know. Be ready to talk through real decisions you've made — trade-offs, debugging approaches, or how you'd approach a problem you haven't solved before.",
    },
    {
      id: "design-portfolio",
      title: "Preparing your design portfolio",
      body: "Bring examples that show your thinking, not only the finished screens. We're interested in the problem you were solving, the constraints you worked within, and how the design evolved.",
    },
    {
      id: "sales-marketing",
      title: "Preparing for sales/marketing conversations",
      body: "Be ready to talk about how you understand a customer's problem and communicate value clearly. Concrete examples of conversations, campaigns or outcomes you've been part of are more useful than a list of tools you've used.",
    },
    {
      id: "what-we-value",
      title: "What we value in applications",
      body: "We look for clear thinking, genuine curiosity and evidence of how you actually work — through projects, past roles, portfolios or the way you describe your experience. A precise, honest application stands out more than a long one.",
    },
  ] as CandidateGuideItem[],
};

export const EARLY_CAREERS_CONTENT = {
  eyebrow: "EARLY CAREER",
  title: "Early in your career?",
  body: "We're interested in people who learn quickly, build thoughtfully and can demonstrate what they know through projects, internships, open-source work, portfolios or practical experience.",
  cta: { label: "Join Job Alerts", href: "#talent-community" },
};

export const TALENT_COMMUNITY_CONTENT = {
  eyebrow: "TALENT COMMUNITY",
  title: "Don't see the right role today?",
  description: "Join the AROORAA talent community and we'll let you know when relevant opportunities open.",
  ctaLabel: "Get Job Alerts",
  consentLabel:
    "I agree to receive AROORAA career opportunities and recruitment-related updates. I can unsubscribe at any time.",
  submitLabel: "Get Job Alerts",
  submittingLabel: "Submitting…",
  successHeading: "You're on the list.",
  successBody: "We'll contact you when AROORAA opens roles that match the career interests you selected.",
};

export const RECRUITMENT_SAFETY_CONTENT = {
  title: "Recruitment safety",
  body: "AROORAA will never ask candidates to pay money as part of the recruitment process. Verify that career communication comes through an official AROORAA channel.",
};

export const EQUAL_OPPORTUNITY_CONTENT = {
  title: "Equal opportunity",
  body: "AROORAA welcomes applicants based on skills, potential and role fit. We want people with different experiences and ways of thinking to feel able to apply.",
};

export interface CareersFaqItem {
  question: string;
  answer: string;
}

export const CAREERS_FAQ_CONTENT = {
  eyebrow: "FAQ",
  title: "Frequently asked questions",
  items: [
    {
      question: "Can I apply if I don't meet every preferred qualification?",
      answer: "Yes. If the core role fits your experience and you believe you can contribute, apply.",
    },
    {
      question: "Can I apply to more than one opening?",
      answer: "Yes, where your experience genuinely fits.",
    },
    {
      question: "Do you accept fresh graduates?",
      answer:
        "It depends on the role. Early-career candidates should check the qualification requirements for a specific opening, and are welcome to join Job Alerts in the meantime.",
    },
    {
      question: "What happens after applying?",
      answer:
        "See “What to expect” above — the exact process may vary by role, but we'll explain what's next before each stage.",
    },
    {
      question: "Can recruiters contact me about future roles?",
      answer: "Only if you've joined the Talent Community or otherwise given consent to be contacted about future roles.",
    },
    {
      question: "Does AROORAA charge candidates?",
      answer: "No. AROORAA will never ask a candidate to pay money as part of the recruitment process.",
    },
  ] as CareersFaqItem[],
};

export const JOB_APPLICATION_CONTENT = {
  fields: {
    fullName: "Full name",
    email: "Email address",
    phone: "Phone number",
    currentLocation: "Current location (optional)",
    experience: "Experience (optional)",
    linkedIn: "LinkedIn profile (optional)",
    portfolio: "Portfolio or GitHub (optional)",
    resume: "Resume (optional)",
    resumeHelper: "PDF, DOC or DOCX, up to 5 MB.",
    resumeRemoveLabel: "Remove",
    note: "Why does this role interest you? (optional)",
  },
  consentLabel:
    "I consent to AROORAA storing and using this information as part of the recruitment process for this role.",
  submitLabel: "Submit application",
  submittingLabel: "Submitting…",
  cancelLabel: "Cancel",
  closeLabel: "Close",
  successHeading: "Application received.",
  successReferenceLabel: "Application reference",
  successRoleLabel: "Role",
};

export const JOB_DETAIL_CONTENT = {
  applyCta: "Apply for this role",
  shareCta: "Share role",
  aboutHeading: "About the role",
  responsibilitiesHeading: "What you'll work on",
  qualificationsHeading: "What we're looking for",
  preferredQualificationsHeading: "Nice to have",
  howWeThinkHeading: "How we think about this role",
  plannedNotice: {
    title: "This role is in the planning stage.",
    body: "It isn't open for applications yet. Join Job Alerts and we'll let you know as soon as it — or something similar — opens.",
  },
  closedNotice: {
    title: "This role is no longer accepting applications.",
    body: "Take a look at our other career paths, or join Job Alerts to hear about future openings.",
  },
  relatedHeading: "Other roles worth a look",
};
