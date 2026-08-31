import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatWeBuild } from "./WhatWeBuild";
import { SERVICE_GROUPS } from "@/lib/content/services";

describe("WhatWeBuild", () => {
  it("renders exactly six primary service groups", () => {
    render(<WhatWeBuild />);
    expect(SERVICE_GROUPS).toHaveLength(6);
    for (const service of SERVICE_GROUPS) {
      expect(screen.getByText(service.name)).toBeInTheDocument();
    }
  });

  it("links each service to its frozen route", () => {
    render(<WhatWeBuild />);
    for (const service of SERVICE_GROUPS) {
      const link = screen.getByRole("link", { name: new RegExp(`^Explore ${service.name}$`) });
      expect(link).toHaveAttribute("href", service.href);
    }
  });

  it("does not render a seventh top-level service", () => {
    render(<WhatWeBuild />);
    const links = screen.getAllByRole("link", { name: /^Explore /i });
    expect(links).toHaveLength(6);
  });

  it("keeps each service description distinct", () => {
    const descriptions = new Set(SERVICE_GROUPS.map((service) => service.description));
    expect(descriptions.size).toBe(SERVICE_GROUPS.length);
  });
});
