import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatHappensNext } from "./WhatHappensNext";

describe("WhatHappensNext", () => {
  it("renders all four steps in order", () => {
    render(<WhatHappensNext />);
    expect(screen.getByRole("heading", { level: 2, name: "What happens next?" })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("You tell us the problem");
    expect(items[3]).toHaveTextContent("We shape the next step");
  });
});
