import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomerProviderBridgeSection } from "./CustomerProviderBridgeSection";

describe("CustomerProviderBridgeSection", () => {
  it("renders the bridge heading and strong line", () => {
    render(<CustomerProviderBridgeSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "A useful product has to work for both sides of the experience." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The customer experience and the provider experience are usually two halves of the same product problem.",
      ),
    ).toBeInTheDocument();
  });
});
