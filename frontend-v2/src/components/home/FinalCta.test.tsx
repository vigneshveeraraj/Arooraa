import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinalCta } from "./FinalCta";
import { FINAL_CTA_CONTENT } from "@/lib/content/cta";

describe("FinalCta", () => {
  it("links Start a Project to /start-project", () => {
    render(<FinalCta />);
    expect(screen.getByRole("link", { name: FINAL_CTA_CONTENT.primary.label })).toHaveAttribute(
      "href",
      FINAL_CTA_CONTENT.primary.href,
    );
  });

  it("links Contact AROORAA to /contact", () => {
    render(<FinalCta />);
    expect(screen.getByRole("link", { name: FINAL_CTA_CONTENT.secondary.label })).toHaveAttribute(
      "href",
      FINAL_CTA_CONTENT.secondary.href,
    );
  });
});
