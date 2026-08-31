import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileWebVisual } from "./MobileWebVisual";

describe("MobileWebVisual", () => {
  it("renders the mobile+web concept image, lazily loaded, with descriptive alt text", () => {
    render(<MobileWebVisual />);
    const img = screen.getByRole("img", { name: /moving between a phone and a laptop/i });
    expect(img).toHaveAttribute("src", "/images/work/mindra/story/mobile-web.webp");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("states the continuity principle and both device columns as real text", () => {
    render(<MobileWebVisual />);
    expect(screen.getByText("One Mindra. One memory. Available across your devices.")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
    expect(screen.getByText("Web")).toBeInTheDocument();
    expect(screen.getByText("Quick capture")).toBeInTheDocument();
    expect(screen.getByText("Keyboard-oriented work")).toBeInTheDocument();
  });

  it("does not claim offline synchronization", () => {
    render(<MobileWebVisual />);
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
  });
});
