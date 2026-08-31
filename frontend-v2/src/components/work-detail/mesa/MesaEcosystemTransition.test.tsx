import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MesaEcosystemTransition } from "./MesaEcosystemTransition";

describe("MesaEcosystemTransition", () => {
  it("renders the eyebrow, heading and short supporting copy", () => {
    render(<MesaEcosystemTransition />);
    expect(screen.getByText("MESA ECOSYSTEM")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "MESA connects the restaurant as one operating experience." })).toBeInTheDocument();
    expect(screen.getByText("Different moments. Different roles. One connected restaurant experience.")).toBeInTheDocument();
  });

  it("renders the ecosystem image, lazily loaded, with descriptive alt text", () => {
    render(<MesaEcosystemTransition />);
    const img = screen.getByRole("img", { name: /MESA connected restaurant ecosystem/i });
    expect(img).toHaveAttribute("src", "/images/work/mesa/story/ecosystem.webp");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders in a section with the expected id", () => {
    const { container } = render(<MesaEcosystemTransition />);
    expect(container.querySelector("#mesa-ecosystem")).toBeInTheDocument();
  });
});
