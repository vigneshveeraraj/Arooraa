import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Wordmark } from "./Wordmark";

describe("Wordmark", () => {
  it("renders the AROORAA text, defaulting to the primary treatment", () => {
    render(<Wordmark />);
    expect(screen.getByText("AROORAA")).toBeInTheDocument();
  });

  it("supports a compact size variant without changing the text content", () => {
    render(<Wordmark size="compact" />);
    expect(screen.getByText("AROORAA")).toBeInTheDocument();
  });
});
