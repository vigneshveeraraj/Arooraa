import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SoftwareDomainIcon, DataDomainIcon, CloudDomainIcon, ConnectedDomainIcon } from "./FutureDomainIcons";

describe("FutureDomainIcons", () => {
  it("renders all four glyphs as decorative svg", () => {
    for (const Icon of [SoftwareDomainIcon, DataDomainIcon, CloudDomainIcon, ConnectedDomainIcon]) {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    }
  });
});
