import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import SmartMirrorEngineeringStoryPage from "./page";

describe("Smart Mirror Product Story page", () => {
  it("renders with exactly one h1 and the approved hero content", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("What if technology could be useful without demanding another screen?");
    expect(screen.getByText("AROORAA PRODUCT STORY · SMART MIRROR")).toBeInTheDocument();
    expect(screen.getAllByText(/COMING SOON/).length).toBeGreaterThan(0);
  });

  it("offers the Explore Smart Mirror and Start a Project hero CTAs", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore Smart Mirror" })).toHaveAttribute("href", "/products/smart-mirror");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("renders all fourteen numbered chapters and the closing story, in order", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const ids = [
      "interaction-contrast",
      "mirror-first",
      "home",
      "gym",
      "salon",
      "hospitality",
      "environments",
      "attention",
      "day-rhythm",
      "physical-product",
      "edge-foundation",
      "privacy",
      "engineering-proof",
      "prototype-vs-future",
      "closing-story",
      "cta",
    ];
    const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("section"));
    let lastIndex = -1;
    for (const id of ids) {
      expect(document.getElementById(id)).not.toBeNull();
      const index = sectionEls.findIndex((el) => el.id === id);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  it("Chapter 2 states the mirror-first key line", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("mirror-first")!);
    expect(
      chapter.getByRole("heading", { name: "A Smart Mirror still has to work as a mirror first." }),
    ).toBeInTheDocument();
    expect(chapter.getByText("If the technology gets in the way of the reflection, the product has failed.")).toBeInTheDocument();
  });

  it("Chapter 3 (Home) tells its story natively, without a second home photograph", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("home")!);
    expect(chapter.getByText("Home experience concept")).toBeInTheDocument();
    expect(chapter.queryByRole("img")).not.toBeInTheDocument();
  });

  it("Chapter 4 (Gym) is explicitly a future/concept fitness experience, never a medical claim", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("gym")!);
    expect(chapter.getByText("Fitness experience concept")).toBeInTheDocument();
    expect(chapter.getByText(/future fitness experience/i)).toBeInTheDocument();
    expect(chapter.getByRole("img")).toHaveAttribute("src", "/images/work/smart-mirror/story/gym-fitness.webp");
  });

  it("Chapter 5 (Salon) is explicitly a future/concept salon experience, stylist and customer in control", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("salon")!);
    expect(chapter.getByText("Salon experience concept")).toBeInTheDocument();
    expect(chapter.getByText(/future salon experience/i)).toBeInTheDocument();
    expect(chapter.getByRole("img")).toHaveAttribute("src", "/images/work/smart-mirror/story/salon-preview.webp");
  });

  it("Chapter 6 (Hospitality) is explicitly a future/concept hospitality experience, not a deployment claim", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("hospitality")!);
    expect(chapter.getByText("Hospitality experience concept")).toBeInTheDocument();
    expect(chapter.getByText(/future hospitality experience/i)).toBeInTheDocument();
    expect(chapter.getByRole("img")).toHaveAttribute("src", "/images/work/smart-mirror/story/hospitality.webp");
  });

  it("Chapter 8 states the relevance-over-data-availability principle", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("attention")!);
    expect(chapter.getByText("Relevance should control visibility, not the amount of available data.")).toBeInTheDocument();
    for (const tier of ["Now", "Soon", "Available"]) {
      expect(chapter.getByText(tier)).toBeInTheDocument();
    }
  });

  it("Chapter 10 is the physical-engineering chapter with the five public-safe layers, image large", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("physical-product")!);
    expect(chapter.getByRole("img")).toHaveAttribute("src", "/images/work/smart-mirror/story/exploded-engineering.webp");
    expect(chapter.getByText("Raspberry Pi 5 prototype edge platform")).toBeInTheDocument();
  });

  it("Chapter 11 states the honest Raspberry Pi 5 prototype wording", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("edge-foundation")!);
    expect(chapter.getByText("The prototype uses Raspberry Pi 5 as an edge-computing foundation for experimentation.")).toBeInTheDocument();
  });

  it("Chapter 12 (Privacy) is dark-toned and states the six trust principles", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    expect(document.getElementById("privacy")).toHaveAttribute("data-tone", "dark");
    const chapter = within(document.getElementById("privacy")!);
    expect(chapter.getByText("Home is a private environment.")).toBeInTheDocument();
  });

  it("Chapter 13 states the four public engineering layers", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const chapter = within(document.getElementById("engineering-proof")!);
    for (const layer of ["Experience", "Display", "Edge", "Physical Product"]) {
      expect(chapter.getByText(layer)).toBeInTheDocument();
    }
  });

  it("Chapter 14 clearly separates current prototype from future application directions", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    // W2.3A: a separate mobile layout duplicates this content in the DOM
    // (only one copy is ever visually exposed at a given viewport), so
    // assertions use getAllByText rather than getByText.
    const chapter = within(document.getElementById("prototype-vs-future")!);
    expect(chapter.getAllByText("Prototype Foundation / Current Exploration").length).toBeGreaterThan(0);
    expect(chapter.getAllByText("Future Application Directions").length).toBeGreaterThan(0);
    expect(chapter.getAllByText("Fitness experiences").length).toBeGreaterThan(0);
    expect(chapter.getAllByText("Salon / styling experiences").length).toBeGreaterThan(0);
    expect(chapter.getAllByText("Hospitality experiences").length).toBeGreaterThan(0);
  });

  it("uses no more than two dark sections (Privacy and the closing story)", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const darkSections = Array.from(document.querySelectorAll('section[data-tone="dark"]'));
    const ids = darkSections.map((el) => el.id).filter((id) => id !== "cta");
    expect(ids.sort()).toEqual(["closing-story", "privacy"]);
  });

  it("offers Explore Smart Mirror and Start a Project on the final CTA", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getAllByRole("link", { name: "Start a Project" }).length).toBeGreaterThan(0);
    expect(cta.getAllByRole("link", { name: "Explore Smart Mirror" }).length).toBeGreaterThan(0);
  });

  it("never claims commercial availability, deployment or a fake partnership/certification", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /available now/i,
      /buy now/i,
      /in stock/i,
      /deployed (customer|installation)/i,
      /trusted by/i,
      /testimonial/i,
      /case stud/i,
      /is an official Raspberry Pi partnership/i,
      /certified by/i,
      /\d+\+?\s*(customers|clients|users|installations)/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("never claims medical assessment, diagnosis or clinically validated biometric accuracy", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/is a clinically validated/i);
    expect(text).not.toMatch(/provides? a medical diagnos/i);
    expect(text).toMatch(/not a medical assessment, a diagnosis or a clinically validated/i);
  });

  it("does not fabricate clients, testimonials, metrics or results, and never mentions Marion", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const pattern of [/award/i, /Marion/, /\$\d/]) {
      expect(text).not.toMatch(pattern);
    }
    expect(text).not.toMatch(/₹/);
  });

  it("does not expose confidential implementation terminology", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const text = (document.body.textContent ?? "").toLowerCase();
    for (const term of ["wiring", "pinout", "bill of materials", "manufacturing cost", "gpio", "kafka", "redis", "postgres"]) {
      expect(text).not.toContain(term);
    }
  });

  it("uses each of the five supplied Smart Mirror images exactly once", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const images = screen.getAllByRole("img");
    const sources = images.map((img) => img.getAttribute("src"));
    for (const src of [
      "/images/work/smart-mirror/story/home-morning.webp",
      "/images/work/smart-mirror/story/gym-fitness.webp",
      "/images/work/smart-mirror/story/salon-preview.webp",
      "/images/work/smart-mirror/story/hospitality.webp",
      "/images/work/smart-mirror/story/exploded-engineering.webp",
    ]) {
      expect(sources.filter((s) => s === src)).toHaveLength(1);
    }
  });

  it("does not accidentally bleed in MESA or Mindra content", () => {
    render(<SmartMirrorEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    // "restaurant" itself is legitimate vocabulary for this page's own
    // Hospitality chapter — the bleed check targets MESA's specific
    // operations/journey vocabulary instead.
    for (const term of ["waiter", "kitchen", "guest journey", "Table Orbit", "Scan QR", "second brain", "My Space", "Family Space"]) {
      expect(text).not.toContain(term);
    }
  });
});
