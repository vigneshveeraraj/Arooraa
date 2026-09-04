import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNav } from "./MobileNav";
import {
  PRIMARY_NAV_LINKS,
  PRODUCT_NAV_LINKS,
  SERVICE_NAV_LINKS,
} from "@/lib/content/navigation";

const PLAIN_LINKS = PRIMARY_NAV_LINKS.filter((link) => !link.children);

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
    for (const link of PLAIN_LINKS) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute("href", link.href);
    }
    // Products and Services are sections here rather than links — an accordion, not a floating
    // panel, because the drawer owns the viewport and there is nothing for a panel to float over.
    for (const label of ["Products", "Services"]) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("expands Products in place, on the same four products the header shows", async () => {
    render(<MobileNav id="mobile-nav" open onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "Products" }));

    for (const product of PRODUCT_NAV_LINKS) {
      expect(screen.getByRole("link", { name: product.label })).toHaveAttribute("href", product.href);
    }
    expect(screen.getByRole("link", { name: "All products" })).toHaveAttribute("href", "/products");
  });

  it("expands Services on the same six services the header shows", async () => {
    render(<MobileNav id="mobile-nav" open onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "Services" }));

    for (const service of SERVICE_NAV_LINKS) {
      expect(screen.getByRole("link", { name: service.label })).toHaveAttribute("href", service.href);
    }
  });

  it("collapses again on a second press", async () => {
    render(<MobileNav id="mobile-nav" open onClose={() => {}} />);
    const toggle = screen.getByRole("button", { name: "Products" });

    await userEvent.click(toggle);
    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "MESA" })).not.toBeInTheDocument();
  });

  it("closes the drawer when a product is chosen", async () => {
    const onClose = vi.fn();
    render(<MobileNav id="mobile-nav" open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Products" }));
    await userEvent.click(screen.getByRole("link", { name: "MESA" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("closes the drawer when a service is chosen", async () => {
    const onClose = vi.fn();
    render(<MobileNav id="mobile-nav" open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Services" }));
    await userEvent.click(screen.getByRole("link", { name: "Product Engineering" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("keeps newly revealed links inside the focus trap", async () => {
    // The trap used to read the panel's focusable elements once, when it opened. Expanding a
    // section adds four links it had never heard of, and Tab would jump straight past them.
    render(<MobileNav id="mobile-nav" open onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Products" }));

    const last = screen.getByRole("link", { name: "Start a Project" });
    last.focus();
    await userEvent.tab();

    expect(document.activeElement).not.toBe(document.body);
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
    const firstLink = PLAIN_LINKS[0];
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
