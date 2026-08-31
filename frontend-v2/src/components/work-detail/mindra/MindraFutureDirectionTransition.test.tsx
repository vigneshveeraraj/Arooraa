import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraFutureDirectionTransition } from "./MindraFutureDirectionTransition";

describe("MindraFutureDirectionTransition", () => {
  it("renders as an unnumbered section with the future-direction heading and the now/future split", () => {
    const { container } = render(<MindraFutureDirectionTransition />);
    expect(container.querySelector("#future-direction")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "The direction is a second brain that becomes more helpful without becoming more intrusive." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Available / Current Foundation")).toBeInTheDocument();
    expect(screen.getByText("Future Direction")).toBeInTheDocument();
  });
});
