import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import SmartMirrorProductPage from "./page";
import { SMART_MIRROR_PRODUCT_PAGE } from "@/lib/content/products";

describe("Smart Mirror product page", () => {
  it("identifies Smart Mirror with the approved public name and positioning", () => {
    render(<SmartMirrorProductPage />);
    expect(screen.getByText("AROORAA PRODUCT · COMING SOON")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "The mirror that understands your day." }),
    ).toBeInTheDocument();
  });

  it("shows Coming Soon / In Development status prominently and never implies release", () => {
    render(<SmartMirrorProductPage />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/now available/i);
    expect(text).not.toMatch(/buy now/i);
    expect(text).not.toMatch(/in stock/i);
    expect(text).not.toMatch(/ships today/i);
  });

  it("never uses M² as public text", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/M²/);
    expect(text).not.toMatch(/\bM2\b/);
  });

  it("does not use Magic Mirror as the primary public product name", () => {
    render(<SmartMirrorProductPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).not.toMatch(/magic mirror/i);
    const heroEyebrow = within(document.getElementById("hero")!);
    expect(heroEyebrow.queryByText(/magic mirror/i)).not.toBeInTheDocument();
  });

  it("offers Explore the Vision and Start a Project hero CTAs", () => {
    render(<SmartMirrorProductPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore the Vision" })).toHaveAttribute("href", "#what-it-does");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("shows the six approved high-level capability groups without claiming they are all shipped", () => {
    render(<SmartMirrorProductPage />);
    for (const item of SMART_MIRROR_PRODUCT_PAGE.whatItDoes!.items) {
      expect(screen.getAllByText(item.name).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/concept and prototype direction/i)).toBeInTheDocument();
  });

  it("presents voice as planned, not already shipped", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/planned voice interaction/i);
    expect(text).not.toMatch(/wake word is shipped/i);
    expect(text).not.toMatch(/voice assistant is available/i);
    expect(text).not.toMatch(/always-listening/i);
    expect(text).not.toMatch(/works offline today/i);
  });

  it("does not make wellness medical claims", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [/medical diagnosis/i, /disease detection/i, /clinical-grade/i, /cures/i, /treats/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not claim production availability or full smart-home compatibility", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/works with every smart home device/i);
    expect(text).not.toMatch(/complete face recognition/i);
    expect(text).not.toMatch(/fully released/i);
  });

  it("shows Raspberry Pi 5 / edge engineering credibility", () => {
    render(<SmartMirrorProductPage />);
    expect(screen.getByText("Raspberry Pi 5 / Edge Platform")).toBeInTheDocument();
    expect(screen.getByText("Where software meets the physical environment.")).toBeInTheDocument();
    expect(screen.getAllByText(/Raspberry Pi 5/).length).toBeGreaterThan(0);
  });

  it("explains the acrylic mirror surface and the display behind it as real text", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/reflective acrylic surface/i);
    expect(text).toMatch(/display becomes visible through the reflective surface/i);
  });

  it("does not expose full internal roadmap or architecture terms", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /phase 0/i,
      /phase 1/i,
      /hardware bom/i,
      /bill of materials/i,
      /network topology/i,
      /api gateway/i,
      /websocket/i,
      /pgvector/i,
      /faster-whisper/i,
      /ollama/i,
      /device credentials/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not name real smart-home vendors", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [/google nest/i, /amazon echo/i, /apple homekit/i, /samsung/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("offers a Start a Project closing CTA, not a Buy Now CTA", () => {
    render(<SmartMirrorProductPage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(cta.getByRole("link", { name: "Explore Our Products" })).toHaveAttribute("href", "/products");
    expect(cta.queryByText(/buy now/i)).not.toBeInTheDocument();
    expect(cta.queryByText(/waitlist/i)).not.toBeInTheDocument();
  });

  it("keeps the approved section structure", () => {
    render(<SmartMirrorProductPage />);
    for (const id of [
      "hero",
      "why-we-built-it",
      "the-problem",
      "product-vision",
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

  it("renders the Smart Mirror picture-story visuals", () => {
    render(<SmartMirrorProductPage />);
    expect(screen.getByText("Concept visualization")).toBeInTheDocument();
    expect(screen.getByText(/Morning/)).toBeInTheDocument();
    expect(screen.getByText(/Evening/)).toBeInTheDocument();
    expect(screen.getByText("My Space", { selector: "p" })).toBeInTheDocument();
  });

  it("renders the realistic hero, morning and engineering photographs with real alt text", () => {
    render(<SmartMirrorProductPage />);
    // The hero visual sits inside the template's aria-hidden hero wrapper (the hero copy
    // already states the same facts as real text), so it's queried by alt attribute rather
    // than accessible role — getByRole would correctly exclude it from the a11y tree.
    expect(
      screen.getByAltText("Concept visualization of AROORAA Smart Mirror displaying a morning briefing in a modern home."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Concept visualization of AROORAA Smart Mirror in a bedroom in the morning, showing the time, weather, a first meeting and a family reminder.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Exploded Smart Mirror concept showing reflective acrylic surface, display panel, Raspberry Pi 5 and rear mounting system.",
      }),
    ).toBeInTheDocument();
  });

  it("renders all five semantic hardware summary labels as real, accessible text", () => {
    render(<SmartMirrorProductPage />);
    for (const label of [
      "Reflective acrylic surface",
      "Digital display",
      "Raspberry Pi 5 edge platform",
      "Slim frame",
      "Rear mounting system",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("does not claim an official Raspberry Pi partnership or certification", () => {
    render(<SmartMirrorProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/official raspberry pi partner/i);
    expect(text).not.toMatch(/certified/i);
    expect(text).not.toMatch(/sponsorship/i);
  });
});
