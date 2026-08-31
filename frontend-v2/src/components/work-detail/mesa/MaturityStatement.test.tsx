import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaturityStatement } from "./MaturityStatement";

describe("MaturityStatement", () => {
  it("renders the honest maturity badge and body copy with no fabricated scale claims", () => {
    render(<MaturityStatement />);
    expect(screen.getByText("FLAGSHIP PRODUCT · ACTIVE DEVELOPMENT")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+\+?\s*(restaurants|customers)/i);
    expect(text).not.toMatch(/\$\d/);
  });
});
