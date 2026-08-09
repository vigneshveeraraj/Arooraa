import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "./Nav";
import { DemoModalProvider } from "@/components/demo-request/DemoModalContext";
import { DemoRequestModal } from "@/components/demo-request/DemoRequestModal";

function renderNav() {
  return render(
    <DemoModalProvider>
      <Nav />
      <DemoRequestModal />
    </DemoModalProvider>,
  );
}

describe("Nav", () => {
  it("shows both the Start a Project and Book a Demo CTAs, as two distinct calls to action", () => {
    renderNav();

    const startProject = screen.getByRole("link", { name: "Start a Project" });
    expect(startProject).toHaveAttribute("href", "/start-project");
    expect(screen.getByRole("button", { name: "Book a Demo" })).toBeInTheDocument();
  });

  it("links Services to the dedicated /services page", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
  });

  it("the MESA demo flow still opens from the nav (no regression from adding Start a Project)", async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getByRole("button", { name: "Book a Demo" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Book a Personalised Demo" })).toBeInTheDocument();
  });
});
