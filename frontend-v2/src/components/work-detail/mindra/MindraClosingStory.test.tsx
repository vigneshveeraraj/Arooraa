import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraClosingStory } from "./MindraClosingStory";

describe("MindraClosingStory", () => {
  it("renders the closing heading, supporting copy and the orbit visual with its principle", () => {
    const { container } = render(<MindraClosingStory />);
    expect(container.querySelector("#closing-story")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Mindra started with a simple question: what should we stop forcing ourselves to remember?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/calmer way to capture, organize and use/)).toBeInTheDocument();
    expect(screen.getByText("The person is the center. Mindra quietly supports the information around them.")).toBeInTheDocument();
  });
});
