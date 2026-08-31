import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CrossProjectQuestionsSection } from "./CrossProjectQuestionsSection";

describe("CrossProjectQuestionsSection", () => {
  it("renders the section heading and all ten questions as real text, not a filled grid", () => {
    render(<CrossProjectQuestionsSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Different products. Repeating engineering questions." }),
    ).toBeInTheDocument();
    const section = within(document.getElementById("cross-project")!);
    for (const question of [
      "Who is the user?",
      "What happens when something fails?",
      "What should remain simple?",
      "What data needs boundaries?",
      "What belongs locally?",
      "What needs real-time coordination?",
      "What should be automated?",
      "What should remain under human control?",
      "What is necessary now?",
      "What can wait?",
    ]) {
      expect(section.getByText(question)).toBeInTheDocument();
    }
    expect(document.querySelectorAll("table")).toHaveLength(0);
  });

  it("tags each question with real product names, not a spreadsheet of every product", () => {
    render(<CrossProjectQuestionsSection />);
    const section = within(document.getElementById("cross-project")!);
    const row = section.getByText("What needs real-time coordination?").closest("li")!;
    expect(within(row).getByText("MESA")).toBeInTheDocument();
    expect(within(row).queryByText("Mindra")).not.toBeInTheDocument();
  });
});
