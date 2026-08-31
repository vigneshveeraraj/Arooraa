import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNav } from "./MobileNav";
import { PRIMARY_NAV_LINKS } from "@/lib/content/navigation";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>trigger</button>
      <MobileNav id="mobile-nav" open={open} onClose={() => setOpen(false)} />
    </>
  );
}

describe("MobileNav", () => {
  it("renders nothing when closed", () => {
    render(<MobileNav id="mobile-nav" open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens via an external control and renders every navigation item", async () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("trigger"));

    expect(screen.getByRole("dialog", { name: "Site navigation" })).toBeInTheDocument();
    for (const link of PRIMARY_NAV_LINKS) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute("href", link.href);
    }
  });

  it("closes when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(<MobileNav id="mobile-nav" open onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<MobileNav id="mobile-nav" open onClose={onClose} />);
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeTruthy();
    if (backdrop) await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes after a navigation link is clicked", async () => {
    const onClose = vi.fn();
    render(<MobileNav id="mobile-nav" open onClose={onClose} />);
    const firstLink = PRIMARY_NAV_LINKS[0];
    if (!firstLink) throw new Error("expected at least one nav link");
    await userEvent.click(screen.getByRole("link", { name: firstLink.label }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes after the Start a Project CTA is clicked", async () => {
    const onClose = vi.fn();
    render(<MobileNav id="mobile-nav" open onClose={onClose} />);
    await userEvent.click(screen.getByRole("link", { name: "Start a Project" }));
    expect(onClose).toHaveBeenCalled();
  });
});
