/**
 * The shared, reusable content contract for individual service detail pages
 * (S1 — Services Index + Shared Service Page Template milestone). Modeled
 * deliberately close to ProductPageContent's own conventions (optional
 * middle sections, plain text/list/feature shapes) so the two template
 * families stay easy to reason about together, without literally sharing
 * types across two different domains.
 *
 * S1 defined this contract with no live route wired to it yet. S2 (Product
 * Strategy & Discovery) is the first real page and needed two small,
 * additive refinements: `audience`, `outcomes` and `relatedWork` upgraded
 * from a plain string list to the already-existing ServiceCapabilitySection
 * (name+description) shape — a pure content-model improvement, not an
 * S2-specific hack, since it just reuses a type every future service can
 * also use for a richer list. And a generic, optional `sectionVisuals` prop
 * on the template (mirroring ProductSectionVisuals) for a restrained
 * companion diagram under any one section — omitted entirely, every other
 * section/page renders exactly as before.
 *
 * S4 (AI, Data & Automation) needed several more additive slots: a short
 * `note` on ServiceListSection/ServiceCapabilitySection for one restrained
 * credibility/disclaimer line under a list (e.g. "sometimes the right
 * answer is automation without AI"); a new ServiceComparisonSection shape
 * (two labeled columns, e.g. Machine / Human) for a side-by-side
 * collaboration section; and several new optional top-level
 * ServicePageContent fields for content shapes no existing service page
 * needed yet (transformation narrative, collaboration, agentic-AI framing,
 * data story, intelligence-system overview, illustrative examples, safety
 * boundaries). Every addition defaults to absent/undefined, so Product
 * Strategy & Discovery (S2/S2.1) renders identically — it sets none of them.
 *
 * S5 (Application Modernization) needed one more small addition: an
 * optional `eyebrow` override on ServiceTextSection/ServiceListSection. Some
 * of S4's generically-typed-but-specifically-named slots (`dataStory`,
 * `safety`, ...) carry a hardcoded default eyebrow in the template that
 * fits their original AI/Automation content ("Data & Context", "AI
 * Boundaries") but would be visibly wrong if that same slot is reused for
 * unrelated content on another page. Rather than adding more single-purpose
 * fields, a page can now override just the visible label while reusing the
 * slot's existing position/shape — additive, defaults to the template's
 * current hardcoded eyebrow when omitted.
 *
 * S6 (Cloud & Platform Engineering) extended the same `eyebrow` override to
 * ServiceComparisonSection and ServiceCapabilitySection, for exactly the
 * same reason: it reuses `collaboration` (default eyebrow "Human +
 * Machine") for a Prevent/Recover reliability split, and `examples`
 * (default eyebrow "Example Use Cases") for a Security by Design capability
 * grid — both AI/Automation defaults would be visibly wrong here.
 *
 * S7 (Continuous Engineering) was explicitly asked to look and feel more
 * distinctive than the prior service pages, without forking the shared
 * template. Two small, opt-in additions on ServiceTextSection make that
 * possible: `layout: "featured"` (an asymmetrical text/visual split for one
 * flagship section — same "opt-in layout variant" pattern as ListBlock's
 * `layout: "split"` from S2.1) and `tone: "dark"` (reuses Section's
 * existing, already-proven dark-tone remap — previously only the closing
 * CTA used it — to give one mid-page section real visual contrast, a "band"
 * moment). Both default to the template's current behavior when omitted,
 * so every earlier page (which sets neither) renders unchanged.
 */
import type { ReactNode } from "react";

export interface ServiceCtaAction {
  label: string;
  href: string;
}

export interface ServiceTextSection {
  title: string;
  body: string;
  /** Overrides the section's default template eyebrow — see S5's note above. */
  eyebrow?: string;
  /** "featured" renders an asymmetrical text/visual split instead of the
   * default stacked heading-then-visual layout. Opt-in; only takes effect
   * when a visual is also supplied. See S7's note above. */
  layout?: "standard" | "featured";
  /** "dark" applies Section's existing dark-tone remap to this one section
   * — a deliberate visual "band" moment, not a global dark mode. Opt-in,
   * defaults to the template's normal light tone. See S7's note above. */
  tone?: "light" | "dark";
}

export interface ServiceListSection {
  title: string;
  items: string[];
  /** A single restrained line beneath the list — e.g. a credibility
   * statement or scope disclaimer. Optional; omitted renders nothing. */
  note?: string;
  /** Overrides the section's default template eyebrow — see S5's note above. */
  eyebrow?: string;
}

export interface ServiceCapabilityItem {
  name: string;
  description: string;
}

export interface ServiceCapabilitySection {
  title: string;
  items: ServiceCapabilityItem[];
  /** Same restrained-note mechanism as ServiceListSection — e.g. clarifying
   * that a list of examples is illustrative, not a delivered-client list. */
  note?: string;
  /** Overrides the section's default template eyebrow — see S5's note above. */
  eyebrow?: string;
}

export interface ServiceComparisonSide {
  label: string;
  items: string[];
}

/** A two-column labeled comparison (e.g. Machine / Human) — generic enough
 * for any future service that wants a side-by-side split, not specific to
 * AI/Automation's Human + Machine collaboration section. */
export interface ServiceComparisonSection {
  title: string;
  left: ServiceComparisonSide;
  right: ServiceComparisonSide;
  /** Overrides the section's default template eyebrow — see S5's note above. */
  eyebrow?: string;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceFaqSection {
  title: string;
  items: ServiceFaqItem[];
}

export interface ServicePageContent {
  id: string;
  name: string;
  hero: {
    eyebrow?: string;
    title: string;
    supporting: string;
    primaryCta?: ServiceCtaAction;
    secondaryCta?: ServiceCtaAction;
  };
  /** Why this service exists / the business problem it addresses. */
  businessProblem?: ServiceTextSection;
  /** "Who It's For" — short audience groups, each with a one-line situation. */
  audience?: ServiceCapabilitySection;
  /** "Problems We Solve" — concrete pain points, as a plain list. */
  problems?: ServiceListSection;
  /** A short narrative visual moment (e.g. "from repetitive work to
   * intelligent flow") — prose plus its own companion visual, not a
   * re-statement of problems/outcomes. Added S4; optional for any service. */
  transformation?: ServiceTextSection;
  /** What a client should expect to be true afterward, each with a one-line explanation. */
  outcomes?: ServiceCapabilitySection;
  /** The richer name+description capability grid. */
  capabilities?: ServiceCapabilitySection;
  /** A side-by-side split (e.g. what the machine does vs. what stays with a
   * person) — added S4 for AI/Automation's Human + Machine collaboration
   * section, but generic enough for any future comparison. */
  collaboration?: ServiceComparisonSection;
  /** A short, carefully scoped framing paragraph — added S4 for AI/Automation's
   * agentic-AI treatment, but usable by any service needing one deliberate
   * caveat paragraph outside the main narrative flow. */
  agenticAi?: ServiceTextSection;
  /** Prose explaining what makes the underlying data/context trustworthy —
   * added S4 for AI/Automation, customer-facing only (no schema/infra). */
  dataStory?: ServiceTextSection;
  /** A short intro paragraph for a system-level "how it fits together"
   * overview, typically paired with a companion visual — added S4. */
  intelligenceSystem?: ServiceTextSection;
  /** Illustrative example scenarios (not delivered client work) — reuses
   * the capability-grid shape; use `note` to disclose that they're
   * illustrative. Added S4 for AI/Automation's practical examples. */
  examples?: ServiceCapabilitySection;
  /** Public-safe safety/governance boundaries, as a plain list — added S4
   * for AI/Automation, generic enough for any future service. */
  safety?: ServiceListSection;
  /** A short editorial/perspective section (e.g. AI/Automation's "Where
   * engineering meets imagination") — prose plus its own companion visual. */
  innovation?: ServiceTextSection;
  /** How AROORAA works this service — prose, not a re-listing of the shared delivery lifecycle. */
  approach?: ServiceTextSection;
  engineeringProof?: ServiceListSection;
  /** Related AROORAA products/work, each with a one-line proof statement — not re-fetched product objects. */
  relatedWork?: ServiceCapabilitySection;
  engagement?: ServiceListSection;
  /** Rare/optional — most services stay silent on pricing until explicitly approved. */
  indicativeRange?: ServiceTextSection;
  faq?: ServiceFaqSection;
  cta: {
    title?: string;
    supporting?: string;
    primary: ServiceCtaAction;
    secondary?: ServiceCtaAction;
  };
}

/**
 * Optional per-section companion visual — a React node, not content data
 * (not serializable), same reasoning as ProductPageTemplate's
 * ProductSectionVisuals. Every field optional and additive: a service page
 * that passes none renders exactly as it did before this existed.
 */
export interface ServiceSectionVisuals {
  /** The hero's own companion visual — renders beside the hero text on
   * desktop, stacked below on mobile. Added S4; omitted keeps the hero
   * exactly as it rendered before (text-only, full width). */
  hero?: ReactNode;
  businessProblem?: ReactNode;
  audience?: ReactNode;
  problems?: ReactNode;
  transformation?: ReactNode;
  outcomes?: ReactNode;
  capabilities?: ReactNode;
  collaboration?: ReactNode;
  intelligenceSystem?: ReactNode;
  approach?: ReactNode;
  engineeringProof?: ReactNode;
  relatedWork?: ReactNode;
  innovation?: ReactNode;
  engagement?: ReactNode;
}
