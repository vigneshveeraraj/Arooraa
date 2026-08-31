import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { WorkDetailChapter } from "./WorkDetailChapter";

describe("WorkDetailChapter", () => {
  it("renders the chapter number, eyebrow, title, supporting copy and children in a section with the given id/tone", () => {
    render(
      <WorkDetailChapter id="test-chapter" index="07" eyebrow="TEST EYEBROW" title="Test chapter title." supporting="Test supporting." tone="dark">
        <div data-testid="fake-body">Body content</div>
      </WorkDetailChapter>,
    );
    const section = document.getElementById("test-chapter")!;
    expect(section).toHaveAttribute("data-tone", "dark");
    const scoped = within(section);
    expect(scoped.getByText("07")).toBeInTheDocument();
    expect(scoped.getByText("TEST EYEBROW")).toBeInTheDocument();
    expect(scoped.getByRole("heading", { level: 2, name: "Test chapter title." })).toBeInTheDocument();
    expect(scoped.getByText("Test supporting.")).toBeInTheDocument();
    expect(scoped.getByTestId("fake-body")).toBeInTheDocument();
  });

  it("W2.1.1: renders an optional act marker above the eyebrow when supplied, and nothing when omitted", () => {
    const { rerender } = render(
      <WorkDetailChapter id="act-chapter" index="01" eyebrow="EYEBROW" title="Title." actLabel="ACT 1 — TEST ACT" />,
    );
    expect(within(document.getElementById("act-chapter")!).getByText("ACT 1 — TEST ACT")).toBeInTheDocument();

    rerender(<WorkDetailChapter id="act-chapter" index="01" eyebrow="EYEBROW" title="Title." />);
    expect(within(document.getElementById("act-chapter")!).queryByText(/ACT 1/)).not.toBeInTheDocument();
  });

  it("defaults to a light tone and renders without supporting copy or children", () => {
    render(<WorkDetailChapter id="minimal-chapter" index="01" eyebrow="EYEBROW" title="Minimal title." />);
    const section = document.getElementById("minimal-chapter")!;
    expect(section).toHaveAttribute("data-tone", "light");
    expect(within(section).getByRole("heading", { level: 2, name: "Minimal title." })).toBeInTheDocument();
  });
});
