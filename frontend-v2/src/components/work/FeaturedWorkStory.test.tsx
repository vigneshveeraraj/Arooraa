import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { FeaturedWorkStory } from "./FeaturedWorkStory";
import type { WorkStory } from "@/lib/content/our-work";

const FAKE_STORY: WorkStory = {
  slug: "fake-project",
  number: "99",
  eyebrow: "FAKE CATEGORY",
  title: "Fake Project",
  domain: "Fake Domain",
  lead: "A fake lead line for testing.",
  problemLabel: "THE PROBLEM",
  problem: "A fake problem statement.",
  productThinking: "A fake product-thinking statement.",
  builtLabel: "WHAT WE BUILT",
  built: "A fake built statement.",
  engineeringChallenge: "A fake engineering-challenge statement.",
  maturity: { label: "FAKE STATUS", description: "A fake maturity description." },
  demonstrates: "A fake demonstrates statement.",
  relatedProduct: { label: "Explore the Product", href: "/products/fake-project" },
};

describe("FeaturedWorkStory", () => {
  it("renders the flagship variant with number, title, lead, all four fields and the footer", () => {
    render(<FeaturedWorkStory story={FAKE_STORY} visual={<div data-testid="fake-visual" />} variant="flagship" />);
    const article = document.getElementById("fake-project")!;
    expect(article.tagName.toLowerCase()).toBe("article");
    const scoped = within(article);
    expect(scoped.getByText("99")).toBeInTheDocument();
    expect(scoped.getByRole("heading", { level: 2, name: "Fake Project" })).toBeInTheDocument();
    expect(scoped.getByText("A fake lead line for testing.")).toBeInTheDocument();
    expect(scoped.getByText("THE PROBLEM")).toBeInTheDocument();
    expect(scoped.getByText("A fake problem statement.")).toBeInTheDocument();
    expect(scoped.getByText("PRODUCT THINKING")).toBeInTheDocument();
    expect(scoped.getByText("WHAT WE BUILT")).toBeInTheDocument();
    expect(scoped.getByText("ENGINEERING CHALLENGE")).toBeInTheDocument();
    expect(scoped.getByText("FAKE STATUS")).toBeInTheDocument();
    expect(scoped.getByText("A fake maturity description.")).toBeInTheDocument();
    expect(scoped.getByText("WHAT IT DEMONSTRATES")).toBeInTheDocument();
    expect(scoped.getByRole("link", { name: "Explore the Product" })).toHaveAttribute(
      "href",
      "/products/fake-project",
    );
    expect(scoped.getByTestId("fake-visual")).toBeInTheDocument();
  });

  it("renders the number as decorative (aria-hidden), not a duplicate accessible heading", () => {
    render(<FeaturedWorkStory story={FAKE_STORY} visual={<div />} variant="flagship" />);
    const number = screen.getByText("99");
    expect(number).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an optional band below the split (flagship only)", () => {
    render(
      <FeaturedWorkStory
        story={FAKE_STORY}
        visual={<div />}
        variant="flagship"
        band={<div data-testid="fake-band">Band content</div>}
      />,
    );
    expect(screen.getByTestId("fake-band")).toBeInTheDocument();
  });

  it("keeps content before the visual in DOM order for the standard variant, regardless of reverse", () => {
    const { container } = render(
      <FeaturedWorkStory story={FAKE_STORY} visual={<div data-testid="fake-visual" />} variant="standard" reverse />,
    );
    const article = container.querySelector("article")!;
    const children = Array.from(article.querySelectorAll("[data-testid='fake-visual'], dl"));
    // dl (part of content) must come before the visual test node in DOM order
    expect(children[0]?.tagName.toLowerCase()).toBe("dl");
  });

  it("renders the cinematic variant with a dark tone", () => {
    render(<FeaturedWorkStory story={FAKE_STORY} visual={<div />} variant="cinematic" />);
    const article = document.getElementById("fake-project")!;
    expect(article).toHaveAttribute("data-tone", "dark");
  });

  it("renders the standard/flagship variants with a light tone", () => {
    render(<FeaturedWorkStory story={FAKE_STORY} visual={<div />} variant="standard" />);
    const article = document.getElementById("fake-project")!;
    expect(article).toHaveAttribute("data-tone", "light");
  });
});
