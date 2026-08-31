import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import OurWorkPage from "./page";

describe("Our Work page", () => {
  it("renders with one h1 and the approved hero headline", () => {
    render(<OurWorkPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Products built from real problems.");
  });

  it("shows all four projects with their correct public names", () => {
    render(<OurWorkPage />);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("shows each project's honest maturity label — no fake progress percentages", () => {
    render(<OurWorkPage />);
    expect(screen.getByText("FLAGSHIP PRODUCT · ACTIVE DEVELOPMENT")).toBeInTheDocument();
    expect(screen.getByText("WORKING PRODUCT · MVP")).toBeInTheDocument();
    expect(screen.getByText("PRODUCT CONCEPT · COMING SOON")).toBeInTheDocument();
    expect(screen.getByText("PROTOTYPE · IN DEVELOPMENT")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%\s*(complete|progress|done)/i);
  });

  it("gives MESA the flagship treatment — largest number/title scale and the extra journey band", () => {
    render(<OurWorkPage />);
    const mesa = document.getElementById("mesa")!;
    expect(within(mesa).getByText("01")).toBeInTheDocument();
    expect(within(mesa).getByRole("heading", { level: 2, name: "MESA" })).toBeInTheDocument();
    for (const label of ["Guest", "Operations", "Kitchen", "Billing"]) {
      expect(within(mesa).getByText(label)).toBeInTheDocument();
    }
  });

  it("keeps Smart Mirror framed as concept / coming soon, not a shipped product", () => {
    render(<OurWorkPage />);
    const smartMirror = document.getElementById("smart-mirror")!;
    expect(within(smartMirror).getByText("PRODUCT CONCEPT · COMING SOON")).toBeInTheDocument();
    expect(within(smartMirror).getByText(/Coming Soon/)).toBeInTheDocument();
    expect(smartMirror).toHaveAttribute("data-tone", "dark");
  });

  it("keeps Arooraa Smart Home framed as a prototype / in development, not a deployed product", () => {
    render(<OurWorkPage />);
    const smartHome = document.getElementById("smart-home")!;
    expect(within(smartHome).getByText("PROTOTYPE · IN DEVELOPMENT")).toBeInTheDocument();
    const text = within(smartHome).getByText(/controlled development direction/i);
    expect(text).toBeInTheDocument();
  });

  it("links each project to its existing product page, with no dead /our-work/* child-route links", () => {
    render(<OurWorkPage />);
    const expected: Record<string, string> = {
      mesa: "/products/mesa",
      mindra: "/products/mindra",
      "smart-mirror": "/products/smart-mirror",
      "smart-home": "/products/smart-home-eb",
    };
    for (const [slug, href] of Object.entries(expected)) {
      const section = within(document.getElementById(slug)!);
      expect(section.getByRole("link", { name: "Explore the Product" })).toHaveAttribute("href", href);
    }

    // /our-work/mesa, /our-work/mindra, /our-work/smart-mirror and
    // /our-work/smart-home are real routes as of W2.1/W2.2/W2.3/W2.4 —
    // every other /our-work/* link would still be a dead link and must
    // not appear.
    const allLinks = screen.getAllByRole("link");
    for (const link of allLinks) {
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("/our-work/")) {
        expect(["/our-work/mesa", "/our-work/mindra", "/our-work/smart-mirror", "/our-work/smart-home"]).toContain(href);
      }
    }
  });

  it("W2.4: MESA, Mindra, Smart Mirror and Smart Home each offer their own story link", () => {
    render(<OurWorkPage />);
    const mesa = within(document.getElementById("mesa")!);
    expect(mesa.getByRole("link", { name: "Read the Engineering Story" })).toHaveAttribute("href", "/our-work/mesa");

    const mindra = within(document.getElementById("mindra")!);
    expect(mindra.getByRole("link", { name: "Read the Mindra Story" })).toHaveAttribute("href", "/our-work/mindra");

    const smartMirror = within(document.getElementById("smart-mirror")!);
    expect(smartMirror.getByRole("link", { name: "Read the Smart Mirror Story" })).toHaveAttribute("href", "/our-work/smart-mirror");

    const smartHome = within(document.getElementById("smart-home")!);
    expect(smartHome.getByRole("link", { name: "Read the Arooraa Smart Home Story" })).toHaveAttribute("href", "/our-work/smart-home");
  });

  it("W2.4: the Smart Home story link appears exactly once, with no duplicate story links anywhere on the page", () => {
    render(<OurWorkPage />);
    expect(screen.getAllByRole("link", { name: "Read the Arooraa Smart Home Story" })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Read the Smart Mirror Story" })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Read the Mindra Story" })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Read the Engineering Story" })).toHaveLength(1);
  });

  it("W2.4: adding the Smart Home story link left the rest of the Smart Home card untouched", () => {
    render(<OurWorkPage />);
    const smartHome = within(document.getElementById("smart-home")!);
    expect(smartHome.getByRole("heading", { level: 2, name: "Arooraa Smart Home" })).toBeInTheDocument();
    expect(smartHome.getByText("A smarter home should still behave like a home when the internet disappears.")).toBeInTheDocument();
    expect(smartHome.getByText("PROTOTYPE · IN DEVELOPMENT")).toBeInTheDocument();
    expect(smartHome.getByRole("link", { name: "Explore the Product" })).toHaveAttribute("href", "/products/smart-home-eb");
    expect(document.getElementById("smart-home")).toHaveAttribute("data-tone", "light");
  });

  it("does not use client/testimonial/fabricated-results language, and never mentions Marion", () => {
    render(<OurWorkPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /client says/i,
      /case stud/i,
      /\d+\+?\s*(customers|clients|users)/i,
      /\d+%\s*(roi|growth|uptime|revenue)/i,
      /certified by/i,
      /award/i,
      /Marion/,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("renders the cross-project engineering-questions section", () => {
    render(<OurWorkPage />);
    const section = within(document.getElementById("cross-project")!);
    expect(
      section.getByRole("heading", { level: 2, name: "Different products. Repeating engineering questions." }),
    ).toBeInTheDocument();
    expect(section.getByText("Who is the user?")).toBeInTheDocument();
  });

  it("renders the engineering-range spectrum section", () => {
    render(<OurWorkPage />);
    const section = within(document.getElementById("engineering-range")!);
    expect(section.getByRole("heading", { level: 2, name: "One company. Several kinds of engineering." })).toBeInTheDocument();
    expect(section.getByText("MESA")).toBeInTheDocument();
  });

  it("renders the What We Learned section with five principles", () => {
    render(<OurWorkPage />);
    const section = within(document.getElementById("what-we-learned")!);
    expect(section.getByRole("heading", { level: 2, name: "Building changes how you think about building." })).toBeInTheDocument();
    expect(section.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  it("renders the final Start a Project CTA", () => {
    render(<OurWorkPage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(cta.getByRole("link", { name: "Explore Services" })).toHaveAttribute("href", "/services");
  });

  it("does not publish an indicative price range", () => {
    render(<OurWorkPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
    expect(text).not.toMatch(/\$\d/);
  });
});
