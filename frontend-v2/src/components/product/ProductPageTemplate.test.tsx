import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ProductPageTemplate } from "./ProductPageTemplate";
import { MESA_PRODUCT_PAGE, type ProductPageContent } from "@/lib/content/products";

describe("ProductPageTemplate", () => {
  it("renders the hero with name, status and both hero CTAs", () => {
    render(<ProductPageTemplate content={MESA_PRODUCT_PAGE} />);
    expect(screen.getByRole("heading", { level: 1, name: MESA_PRODUCT_PAGE.hero.title })).toBeInTheDocument();
    expect(screen.getByText("Flagship product")).toBeInTheDocument();

    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Request a Demo" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "Explore MESA" })).toHaveAttribute("href", "#what-it-does");
  });

  it("renders MESA's populated sections", () => {
    render(<ProductPageTemplate content={MESA_PRODUCT_PAGE} />);
    expect(screen.getByText(MESA_PRODUCT_PAGE.whyWeBuiltIt!.title)).toBeInTheDocument();
    expect(screen.getByText(MESA_PRODUCT_PAGE.theProblem!.title)).toBeInTheDocument();
    expect(screen.getByText(MESA_PRODUCT_PAGE.productVision!.title)).toBeInTheDocument();
    expect(screen.getByText(MESA_PRODUCT_PAGE.whatItDoes!.title)).toBeInTheDocument();
    for (const item of MESA_PRODUCT_PAGE.whatItDoes!.items) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }
    expect(screen.getByText(MESA_PRODUCT_PAGE.experience!.title)).toBeInTheDocument();
    expect(screen.getByText(MESA_PRODUCT_PAGE.engineering!.title)).toBeInTheDocument();
    expect(screen.getByText(MESA_PRODUCT_PAGE.whereWereGoing!.title)).toBeInTheDocument();
  });

  it("does not render How It Works for MESA — not supplied", () => {
    render(<ProductPageTemplate content={MESA_PRODUCT_PAGE} />);
    expect(document.getElementById("how-it-works")).toBeNull();
  });

  it("renders the closing CTA with title, supporting copy and both actions", () => {
    render(<ProductPageTemplate content={MESA_PRODUCT_PAGE} />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("heading", { name: MESA_PRODUCT_PAGE.cta.title! })).toBeInTheDocument();
    expect(cta.getByRole("link", { name: MESA_PRODUCT_PAGE.cta.primary.label })).toHaveAttribute(
      "href",
      MESA_PRODUCT_PAGE.cta.primary.href,
    );
    expect(cta.getByRole("link", { name: MESA_PRODUCT_PAGE.cta.secondary!.label })).toHaveAttribute(
      "href",
      MESA_PRODUCT_PAGE.cta.secondary!.href,
    );
  });

  it("stackedVisualSections is opt-in and doesn't change rendering when omitted (MESA unaffected)", () => {
    render(<ProductPageTemplate content={MESA_PRODUCT_PAGE} />);
    expect(screen.getByText(MESA_PRODUCT_PAGE.experience!.title)).toBeInTheDocument();
    expect(screen.getByText(MESA_PRODUCT_PAGE.engineering!.title)).toBeInTheDocument();
  });

  it("stacked experience/engineering sections still render their visual and content when opted in", () => {
    const withVisuals: ProductPageContent = {
      ...MESA_PRODUCT_PAGE,
      experience: { title: "A stacked experience moment.", body: "Body copy." },
      engineering: { title: "A stacked engineering moment.", items: ["Badge One", "Badge Two"] },
    };
    render(
      <ProductPageTemplate
        content={withVisuals}
        stackedVisualSections={["experience", "engineering"]}
        sectionVisuals={{
          experience: <div data-testid="experience-visual">Experience visual</div>,
          engineering: <div data-testid="engineering-visual">Engineering visual</div>,
        }}
      />,
    );
    expect(screen.getByText("A stacked experience moment.")).toBeInTheDocument();
    expect(screen.getByTestId("experience-visual")).toBeInTheDocument();
    expect(screen.getByText("A stacked engineering moment.")).toBeInTheDocument();
    expect(screen.getByText("Badge One")).toBeInTheDocument();
    expect(screen.getByTestId("engineering-visual")).toBeInTheDocument();
  });

  it("renders generically from an unrelated minimal content object — no product-specific hardcoding", () => {
    const minimal: ProductPageContent = {
      id: "test-product",
      name: "Test Product",
      hero: { title: "A generic product", supporting: "Generic supporting copy." },
      cta: { primary: { label: "Start a Project", href: "/start-project" } },
    };
    render(<ProductPageTemplate content={minimal} />);
    expect(screen.getByRole("heading", { level: 1, name: "A generic product" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");

    for (const id of [
      "why-we-built-it",
      "the-problem",
      "product-vision",
      "overview",
      "what-it-does",
      "experience",
      "how-it-works",
      "engineering",
      "where-were-going",
    ]) {
      expect(document.getElementById(id)).toBeNull();
    }
  });

  it("overview is opt-in, sits between Product Vision and What It Does, and doesn't change MESA (not supplied)", () => {
    render(<ProductPageTemplate content={MESA_PRODUCT_PAGE} />);
    expect(document.getElementById("overview")).toBeNull();
  });

  it("renders a supplied overview section, with its visual, between Product Vision and What It Does", () => {
    const withOverview: ProductPageContent = {
      ...MESA_PRODUCT_PAGE,
      overview: { title: "See it all together.", body: "One flagship view of the whole product." },
    };
    render(
      <ProductPageTemplate
        content={withOverview}
        sectionVisuals={{ overview: <div data-testid="overview-visual">Overview visual</div> }}
      />,
    );
    expect(screen.getByText("See it all together.")).toBeInTheDocument();
    expect(screen.getByTestId("overview-visual")).toBeInTheDocument();

    const ids = Array.from(document.querySelectorAll("main > section")).map((section) => section.id);
    expect(ids.indexOf("product-vision")).toBeLessThan(ids.indexOf("overview"));
    expect(ids.indexOf("overview")).toBeLessThan(ids.indexOf("what-it-does"));
  });
});
