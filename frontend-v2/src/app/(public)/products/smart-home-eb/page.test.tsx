import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import SmartHomeProductPage from "./page";
import { SMART_HOME_PRODUCT_PAGE } from "@/lib/content/products";

describe("Arooraa Smart Home product page", () => {
  it("identifies the product with the approved public name", () => {
    render(<SmartHomeProductPage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A smarter home should keep working — even when the internet does not.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("AROORAA PRODUCT · PROTOTYPE IN DEVELOPMENT")).toBeInTheDocument();
    expect(screen.getAllByText(/Arooraa Smart Home/).length).toBeGreaterThan(0);
  });

  it("shows prototype/in-development status and never implies commercial readiness", () => {
    render(<SmartHomeProductPage />);
    expect(screen.getByText("Prototype / In Development")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/now available/i);
    expect(text).not.toMatch(/buy now/i);
    expect(text).not.toMatch(/book installation/i);
    expect(text).not.toMatch(/nationwide installation/i);
    expect(text).not.toMatch(/commercially available/i);
    expect(text).not.toMatch(/fully released/i);
    expect(text).not.toMatch(/whole-home automation is proven/i);
  });

  it("offers Explore the Product Vision and Start a Project hero CTAs", () => {
    render(<SmartHomeProductPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore the Product Vision" })).toHaveAttribute("href", "#what-it-does");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("does not add a prototype-program or assessment-request CTA", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/join the prototype programme/i);
    expect(text).not.toMatch(/request a smart-home assessment/i);
  });

  it("presents local-first as a core principle", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/local-first/i);
    expect(text).toMatch(/keep working when the cloud doesn't/i);
  });

  it("presents manual control as retained, not removed", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/automation should never remove normal control/i);
    expect(text).toMatch(/physical wall switches keep working/i);
  });

  it("shows the six outcome-module capabilities without claiming they are all shipped", () => {
    render(<SmartHomeProductPage />);
    for (const item of SMART_HOME_PRODUCT_PAGE.whatItDoes!.items) {
      expect(screen.getAllByText(item.name).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/prototype focus and planned expansion/i)).toBeInTheDocument();
  });

  it("frames Smart Water as planned expansion, not a current capability", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/planned expansion once the energy foundation is proven/i);
    expect(text).toMatch(/planned expansion after the energy foundation/i);
  });

  it("shows Raspberry Pi 5 only as prototype engineering proof, not a partnership claim", () => {
    render(<SmartHomeProductPage />);
    expect(screen.getByText("Raspberry Pi 5 / Local Gateway")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/prototype direction uses Raspberry Pi 5/i);
    expect(text).not.toMatch(/official raspberry pi partner/i);
    expect(text).not.toMatch(/raspberry pi certified/i);
  });

  it("requires certified equipment and a qualified electrician for mains work", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/qualified electrician required/i);
    expect(text).toMatch(/certified mains equipment required/i);
    expect(text).toMatch(/correctly rated, certified equipment and qualified electrical installation and sign-off/i);
  });

  it("does not give unsafe electrical guidance", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /connect mains directly to (a )?raspberry pi/i,
      /no electrician needed/i,
      /diy the wiring/i,
      /skip certification/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not expose full internal architecture or protocol implementation terms", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /mqtt/i,
      /modbus/i,
      /home assistant/i,
      /phase 0/i,
      /phase 7/i,
      /bill of materials/i,
      /ct ratio/i,
      /db schematic/i,
      /device credentials/i,
      /\bvlan\b/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not show fake savings percentages or guaranteed savings claims", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%\s*(saved|savings)/i);
    expect(text).not.toMatch(/guaranteed savings/i);
  });

  it("keeps the approved section structure", () => {
    render(<SmartHomeProductPage />);
    for (const id of [
      "hero",
      "why-we-built-it",
      "the-problem",
      "product-vision",
      "overview",
      "what-it-does",
      "experience",
      "how-it-works",
      "privacy-trust",
      "engineering",
      "where-were-going",
      "cta",
    ]) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it("offers a Start a Project closing CTA, not a Buy Now CTA", () => {
    render(<SmartHomeProductPage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(cta.getByRole("link", { name: "Explore Our Products" })).toHaveAttribute("href", "/products");
    expect(cta.queryByText(/buy now/i)).not.toBeInTheDocument();
  });

  it("does not link to any smart-home-eb child route", () => {
    render(<SmartHomeProductPage />);
    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    for (const href of links) {
      if (href?.startsWith("/products/smart-home-eb/")) {
        throw new Error(`Unexpected child route link: ${href}`);
      }
    }
  });

  it("does not make autonomous AI control claims", () => {
    render(<SmartHomeProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/autonomous ai/i);
    expect(text).not.toMatch(/ai automatically shuts off/i);
    expect(text).toMatch(/without ever replacing manual control or safety behavior/i);
  });

  it("renders the house-overview, mobile-control and energy-insight photographs with real alt text", () => {
    render(<SmartHomeProductPage />);
    expect(
      screen.getByRole("img", {
        name: "Concept visualization of a two-floor Arooraa Smart Home showing room status, AC state, energy usage and water-tank information.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Concept visualization of the Arooraa Smart Home mobile experience showing room controls, AC status, energy usage, lights and water-tank information.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Concept visualization of Ground Floor Bedroom monthly energy usage with device-level breakdown and local-control status.",
      }),
    ).toBeInTheDocument();
  });

  it("shows the See the home as one connected environment overview section between Product Vision and What It Does", () => {
    render(<SmartHomeProductPage />);
    expect(screen.getByText("See the home as one connected environment.")).toBeInTheDocument();
    const ids = Array.from(document.querySelectorAll("main > section")).map((section) => section.id);
    expect(ids.indexOf("product-vision")).toBeLessThan(ids.indexOf("overview"));
    expect(ids.indexOf("overview")).toBeLessThan(ids.indexOf("what-it-does"));
  });

  it("restates the room/floor story as real HTML, not only baked into the house-overview image", () => {
    render(<SmartHomeProductPage />);
    expect(screen.getByText("First Floor Bedroom")).toBeInTheDocument();
    expect(screen.getByText("Kids Room")).toBeInTheDocument();
    expect(screen.getByText("Ground Floor Bedroom")).toBeInTheDocument();
    expect(screen.getByText("Living Room")).toBeInTheDocument();
    expect(screen.getByText("Example home view")).toBeInTheDocument();
  });

  it("does not use the old Smart Home EB label anywhere on the page", () => {
    render(<SmartHomeProductPage />);
    expect(screen.queryByText("Smart Home EB")).not.toBeInTheDocument();
  });
});
