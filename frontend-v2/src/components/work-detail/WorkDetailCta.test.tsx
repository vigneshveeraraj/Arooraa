import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { WorkDetailCta } from "./WorkDetailCta";

describe("WorkDetailCta", () => {
  it("renders the heading, supporting copy, primary/secondary actions and every related link", () => {
    render(
      <WorkDetailCta
        title="Test closing heading?"
        supporting="Test closing supporting copy."
        primary={{ label: "Start a Project", href: "/start-project" }}
        secondary={{ label: "Explore Product", href: "/products/fake" }}
        relatedLinks={[
          { label: "Product Engineering", href: "/services/product-engineering" },
          { label: "Continuous Engineering", href: "/services/continuous-engineering" },
        ]}
      />,
    );
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("heading", { name: "Test closing heading?" })).toBeInTheDocument();
    expect(cta.getByText("Test closing supporting copy.")).toBeInTheDocument();
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(cta.getByRole("link", { name: "Explore Product" })).toHaveAttribute("href", "/products/fake");
    expect(cta.getByRole("link", { name: "Product Engineering" })).toHaveAttribute("href", "/services/product-engineering");
    expect(cta.getByRole("link", { name: "Continuous Engineering" })).toHaveAttribute("href", "/services/continuous-engineering");
  });
});
