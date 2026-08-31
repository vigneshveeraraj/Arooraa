import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders each variant as an accessible button", () => {
    render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Secondary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ghost" })).toBeInTheDocument();
  });

  it("defaults to type=button so it never accidentally submits a form", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toHaveAttribute("type", "button");
  });

  it("is disabled, exposes disabled state, and does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as a real link with the correct href when href is provided", () => {
    render(<Button href="/start-project">Start a project</Button>);
    const link = screen.getByRole("link", { name: "Start a project" });
    expect(link).toHaveAttribute("href", "/start-project");
  });

  it("renders a disabled href as inert text, not a clickable anchor", () => {
    render(
      <Button href="/start-project" disabled>
        Start a project
      </Button>,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Start a project")).toHaveAttribute("aria-disabled", "true");
  });
});
