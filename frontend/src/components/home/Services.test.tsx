import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Services } from "./Services";
import { SERVICES } from "@/lib/services-content";

describe("Services (home section)", () => {
  it("renders all six service cards linking into /services", () => {
    render(<Services />);

    expect(SERVICES).toHaveLength(6);
    for (const service of SERVICES) {
      const link = screen.getByRole("link", { name: new RegExp(service.title) });
      expect(link).toHaveAttribute("href", `/services#${service.id}`);
    }
  });

  it("links to the dedicated services page", () => {
    render(<Services />);
    expect(screen.getByRole("link", { name: "See all services" })).toHaveAttribute("href", "/services");
  });

  it("section id matches the #services nav anchor", () => {
    const { container } = render(<Services />);
    expect(container.querySelector("section#services")).not.toBeNull();
  });
});
