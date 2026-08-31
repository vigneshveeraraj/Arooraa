import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "./Section";

describe("Section", () => {
  it("defaults to a light tone", () => {
    render(
      <Section>
        <p>content</p>
      </Section>,
    );
    expect(screen.getByText("content").closest("section")).toHaveAttribute("data-tone", "light");
  });

  it("applies a dark tone when requested, so descendant tokens remap", () => {
    render(
      <Section tone="dark">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByText("content").closest("section")).toHaveAttribute("data-tone", "dark");
  });

  it("renders as the requested element via the as prop", () => {
    render(
      <Section as="div" id="custom">
        <p>content</p>
      </Section>,
    );
    expect(document.getElementById("custom")?.tagName).toBe("DIV");
  });
});
