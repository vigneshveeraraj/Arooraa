import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { WorkFinalCta } from "./WorkFinalCta";

describe("WorkFinalCta", () => {
  it("renders the closing heading, supporting copy and both actions", () => {
    render(<WorkFinalCta />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("heading", { name: "Have a problem worth turning into a product?" })).toBeInTheDocument();
    expect(cta.getByText(/You do not need to arrive with the architecture/)).toBeInTheDocument();
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(cta.getByRole("link", { name: "Explore Services" })).toHaveAttribute("href", "/services");
  });
});
