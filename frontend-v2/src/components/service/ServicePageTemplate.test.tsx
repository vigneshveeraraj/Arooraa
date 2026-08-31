import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ServicePageTemplate } from "./ServicePageTemplate";
import styles from "./ServicePageTemplate.module.css";
import type { ServicePageContent } from "@/lib/content/service-page";

/**
 * A deliberately fake, test-only service object — not real AROORAA content
 * and not wired to any route. Exists purely to validate that every optional
 * ServicePageTemplate section renders correctly (brief §15: validate via a
 * test-only fake object, not a stub route).
 */
const FAKE_SERVICE: ServicePageContent = {
  id: "fake-service",
  name: "Fake Service",
  hero: {
    eyebrow: "TEST SERVICE",
    title: "A fake service for template testing.",
    supporting: "This content exists only to validate the shared template.",
    primaryCta: { label: "Start a Project", href: "/start-project" },
    secondaryCta: { label: "Contact AROORAA", href: "/contact" },
  },
  businessProblem: { title: "The business problem.", body: "Fake business-problem body copy." },
  audience: {
    title: "Who it's for.",
    items: [
      { name: "Founders", description: "Fake founder situation." },
      { name: "Engineering leaders", description: "Fake engineering-leader situation." },
    ],
  },
  problems: {
    title: "Problems we solve.",
    items: ["Problem one", "Problem two"],
    note: "Fake problems note.",
    eyebrow: "Custom Problems Eyebrow",
  },
  transformation: {
    title: "The fake shift.",
    body: "Fake transformation body copy.",
    layout: "featured",
    tone: "dark",
  },
  outcomes: {
    title: "Outcomes.",
    items: [
      { name: "Outcome One", description: "Fake outcome one explanation." },
      { name: "Outcome Two", description: "Fake outcome two explanation." },
    ],
  },
  capabilities: {
    title: "Capabilities.",
    items: [
      { name: "Capability One", description: "Description one." },
      { name: "Capability Two", description: "Description two." },
    ],
  },
  collaboration: {
    title: "Fake collaboration heading.",
    left: { label: "Machine", items: ["Extract", "Classify"] },
    right: { label: "Human", items: ["Review", "Decide"] },
    eyebrow: "Custom Collaboration Eyebrow",
  },
  agenticAi: { title: "Fake agentic framing.", body: "Fake agentic body copy." },
  dataStory: { title: "Fake data story.", body: "Fake data-story body copy.", eyebrow: "Custom Data Eyebrow" },
  intelligenceSystem: { title: "Fake system overview.", body: "Fake system body copy." },
  examples: {
    title: "Fake example use cases.",
    items: [{ name: "Example One", description: "Fake example one description." }],
    note: "Fake examples note.",
    eyebrow: "Custom Examples Eyebrow",
  },
  approach: { title: "Our approach.", body: "Fake approach body copy." },
  engineeringProof: { title: "Engineering proof.", items: ["Proof One", "Proof Two"] },
  safety: { title: "Fake safety boundaries.", items: ["Boundary One", "Boundary Two"] },
  innovation: { title: "Fake perspective heading.", body: "Fake perspective body copy." },
  relatedWork: {
    title: "Related work.",
    items: [
      { name: "MESA", description: "Fake MESA proof line." },
      { name: "Mindra", description: "Fake Mindra proof line." },
    ],
  },
  engagement: { title: "Engagement model.", items: ["Discovery Sprint", "Build Engagement"] },
  indicativeRange: { title: "Indicative range.", body: "Fake indicative-range body copy." },
  faq: {
    title: "Frequently asked questions.",
    items: [{ question: "A fake question?", answer: "A fake answer." }],
  },
  cta: {
    title: "Ready to start?",
    supporting: "Fake closing CTA copy.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Contact AROORAA", href: "/contact" },
  },
};

describe("ServicePageTemplate", () => {
  it("renders the hero with eyebrow, title, supporting copy and both CTAs", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    expect(screen.getByText("TEST SERVICE")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "A fake service for template testing." }),
    ).toBeInTheDocument();
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "Contact AROORAA" })).toHaveAttribute("href", "/contact");
  });

  it("renders every optional section when supplied", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    for (const id of [
      "business-problem",
      "who-its-for",
      "problems-we-solve",
      "transformation",
      "outcomes",
      "capabilities",
      "human-and-machine",
      "agentic-ai",
      "data-and-context",
      "how-it-fits-together",
      "example-use-cases",
      "approach",
      "engineering-proof",
      "ai-boundaries",
      "related-work",
      "engineering-meets-imagination",
      "engagement-model",
      "indicative-range",
      "faq",
    ]) {
      expect(document.getElementById(id)).not.toBeNull();
    }
    expect(screen.getByText("Founders")).toBeInTheDocument();
    expect(screen.getByText("Problem one")).toBeInTheDocument();
    expect(screen.getByText("Capability One")).toBeInTheDocument();
    expect(screen.getByText("Description one.")).toBeInTheDocument();
    expect(screen.getByText("A fake question?")).toBeInTheDocument();
    expect(screen.getByText("A fake answer.")).toBeInTheDocument();
  });

  it("S4: renders the new comparison, note and text sections with their real content", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    const collaboration = within(document.getElementById("human-and-machine")!);
    expect(collaboration.getByText("Machine")).toBeInTheDocument();
    expect(collaboration.getByText("Extract")).toBeInTheDocument();
    expect(collaboration.getByText("Human")).toBeInTheDocument();
    expect(collaboration.getByText("Review")).toBeInTheDocument();

    expect(screen.getByText("Fake problems note.")).toBeInTheDocument();
    expect(screen.getByText("Fake examples note.")).toBeInTheDocument();
    expect(screen.getByText("Fake agentic body copy.")).toBeInTheDocument();
    expect(screen.getByText("Fake data-story body copy.")).toBeInTheDocument();
    expect(screen.getByText("Fake perspective body copy.")).toBeInTheDocument();
  });

  it("S5: a section's own eyebrow overrides the template's default eyebrow for that slot", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    expect(screen.getByText("Custom Problems Eyebrow")).toBeInTheDocument();
    expect(screen.queryByText("Problems We Solve")).not.toBeInTheDocument();
    expect(screen.getByText("Custom Data Eyebrow")).toBeInTheDocument();
    expect(screen.queryByText("Data & Context")).not.toBeInTheDocument();
  });

  it("S6: the eyebrow override also applies to ComparisonBlock (collaboration)", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    expect(screen.getByText("Custom Collaboration Eyebrow")).toBeInTheDocument();
    expect(screen.queryByText("Human + Machine")).not.toBeInTheDocument();
  });

  it("S6: the eyebrow override also applies to CapabilityBlock (examples)", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    expect(screen.getByText("Custom Examples Eyebrow")).toBeInTheDocument();
    expect(screen.queryByText("Example Use Cases")).not.toBeInTheDocument();
  });

  it("S7: layout 'featured' falls back to the standard stacked layout when no visual is supplied", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    const section = document.getElementById("transformation")!;
    expect(within(section).getByText("The fake shift.")).toBeInTheDocument();
    expect(within(section).queryByTestId("fake-featured-visual")).not.toBeInTheDocument();
    // dark tone still applies even without a visual, since tone and layout are independent
    expect(section).toHaveAttribute("data-tone", "dark");
  });

  it("S7: layout 'featured' renders an asymmetrical split with the section's dark tone applied, when a visual is supplied", () => {
    render(
      <ServicePageTemplate
        content={FAKE_SERVICE}
        sectionVisuals={{ transformation: <div data-testid="fake-featured-visual">Featured visual</div> }}
      />,
    );
    const section = document.getElementById("transformation")!;
    expect(within(section).getByText("The fake shift.")).toBeInTheDocument();
    expect(within(section).getByTestId("fake-featured-visual")).toBeInTheDocument();
    expect(section).toHaveAttribute("data-tone", "dark");
  });

  it("S7: a TextBlock without layout/tone set still renders with the default light tone", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    const businessProblem = document.getElementById("business-problem")!;
    expect(businessProblem).toHaveAttribute("data-tone", "light");
  });

  it("S4: hero renders without a visual slot when sectionVisuals.hero is omitted, and with one when supplied", () => {
    const { rerender } = render(<ServicePageTemplate content={FAKE_SERVICE} />);
    expect(screen.queryByTestId("fake-hero-visual")).not.toBeInTheDocument();

    rerender(
      <ServicePageTemplate
        content={FAKE_SERVICE}
        sectionVisuals={{ hero: <div data-testid="fake-hero-visual">Hero visual</div> }}
      />,
    );
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByTestId("fake-hero-visual")).toBeInTheDocument();
    expect(hero.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("S8.2: heroLayout defaults to the original text-led hero grid, and only changes when set to balanced", () => {
    const { rerender } = render(
      <ServicePageTemplate
        content={FAKE_SERVICE}
        sectionVisuals={{ hero: <div data-testid="fake-hero-visual">Hero visual</div> }}
      />,
    );
    const heroSection = () => document.getElementById("hero")!;
    expect(heroSection().querySelector(`.${styles.heroGrid}`)).not.toBeNull();
    expect(heroSection().querySelector(`.${styles.heroGridBalanced}`)).toBeNull();

    rerender(
      <ServicePageTemplate
        content={FAKE_SERVICE}
        sectionVisuals={{ hero: <div data-testid="fake-hero-visual">Hero visual</div> }}
        heroLayout="balanced"
      />,
    );
    expect(heroSection().querySelector(`.${styles.heroGridBalanced}`)).not.toBeNull();
    expect(heroSection().querySelector(`.${styles.heroGrid}`)).toBeNull();
  });

  it("renders the closing CTA with title, supporting copy and both actions", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("heading", { name: "Ready to start?" })).toBeInTheDocument();
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(cta.getByRole("link", { name: "Contact AROORAA" })).toHaveAttribute("href", "/contact");
  });

  it("does not force empty sections — renders only what a partial service supplies", () => {
    const partial: ServicePageContent = {
      id: "partial-service",
      name: "Partial Service",
      hero: { title: "A minimal service page.", supporting: "Minimal supporting copy." },
      cta: { primary: { label: "Start a Project", href: "/start-project" } },
    };
    render(<ServicePageTemplate content={partial} />);
    expect(screen.getByRole("heading", { level: 1, name: "A minimal service page." })).toBeInTheDocument();
    for (const id of [
      "business-problem",
      "who-its-for",
      "problems-we-solve",
      "transformation",
      "outcomes",
      "capabilities",
      "human-and-machine",
      "agentic-ai",
      "data-and-context",
      "how-it-fits-together",
      "example-use-cases",
      "approach",
      "engineering-proof",
      "ai-boundaries",
      "related-work",
      "engineering-meets-imagination",
      "engagement-model",
      "indicative-range",
      "faq",
    ]) {
      expect(document.getElementById(id)).toBeNull();
    }
    expect(document.getElementById("cta")).not.toBeNull();
  });

  it("sectionVisuals is opt-in and doesn't change rendering when omitted", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    expect(screen.getByText("The business problem.")).toBeInTheDocument();
    expect(screen.queryByTestId("fake-visual")).not.toBeInTheDocument();
  });

  it("renders a supplied section visual below the section's content", () => {
    render(
      <ServicePageTemplate
        content={FAKE_SERVICE}
        sectionVisuals={{ approach: <div data-testid="fake-visual">Approach visual</div> }}
      />,
    );
    const approachSection = within(document.getElementById("approach")!);
    expect(approachSection.getByText("Our approach.")).toBeInTheDocument();
    expect(approachSection.getByTestId("fake-visual")).toBeInTheDocument();
  });

  it("S2.1: engagement renders with its heading and items still present regardless of split layout", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    const engagement = within(document.getElementById("engagement-model")!);
    expect(engagement.getByText("Engagement model.")).toBeInTheDocument();
    expect(engagement.getByText("Discovery Sprint")).toBeInTheDocument();
    expect(engagement.getByText("Build Engagement")).toBeInTheDocument();
  });

  it("S2.1: related-work renders with its heading and items still present regardless of the wider column count", () => {
    render(<ServicePageTemplate content={FAKE_SERVICE} />);
    const relatedWork = within(document.getElementById("related-work")!);
    expect(relatedWork.getByText("Related work.")).toBeInTheDocument();
    expect(relatedWork.getByText("MESA")).toBeInTheDocument();
    expect(relatedWork.getByText("Fake MESA proof line.")).toBeInTheDocument();
  });
});
