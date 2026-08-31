import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MesaJourneyStrip } from "./MesaJourneyStrip";

describe("MesaJourneyStrip", () => {
  it("renders the five journey steps as real, accessible text in order", () => {
    render(<MesaJourneyStrip />);
    const items = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(items).toEqual(["Guest", "Restaurant Team", "Kitchen", "Service", "Business View"]);
  });

  it("does not simulate a technical order-state machine", () => {
    render(<MesaJourneyStrip />);
    const text = document.body.textContent ?? "";
    const disallowed = [/pending/i, /accepted/i, /idempoten/i, /state transition/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
