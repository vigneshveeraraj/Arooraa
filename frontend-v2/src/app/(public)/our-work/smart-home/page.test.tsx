import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import SmartHomeEngineeringStoryPage from "./page";

describe("Arooraa Smart Home Product Story page", () => {
  it("renders with exactly one h1 and the approved hero content", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("A smarter home should keep working — even when the internet does not.");
    expect(screen.getByText("AROORAA PRODUCT STORY · SMART HOME")).toBeInTheDocument();
    expect(screen.getAllByText(/PROTOTYPE DIRECTION/).length).toBeGreaterThan(0);
  });

  it("offers the Explore Arooraa Smart Home and Start a Project hero CTAs, pointing at the unchanged product route", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore Arooraa Smart Home" })).toHaveAttribute("href", "/products/smart-home-eb");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("renders all fourteen numbered chapters and the closing story, in order", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const ids = [
      "real-problem",
      "normal-home",
      "local-first",
      "energy-visibility",
      "expand-carefully",
      "manual-control",
      "home-resources",
      "retrofit",
      "safety",
      "engineering-foundation",
      "intelligence",
      "prototype-journey",
      "whole-home",
      "current-vs-future",
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

  it("Chapter 2 states the normal-home principle", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("normal-home")!);
    expect(chapter.getByRole("heading", { name: "A smart home should still feel like a normal home." })).toBeInTheDocument();
    expect(chapter.getByText("Technology should add capability without removing familiarity.")).toBeInTheDocument();
  });

  it("Chapter 3 states local-first without exposing protocol internals", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("local-first")!);
    expect(chapter.getByText("Local Home Layer")).toBeInTheDocument();
    expect(chapter.getByText("External / Cloud Services")).toBeInTheDocument();
  });

  it("Chapter 4 (Energy Visibility) uses the energy-visibility image as a labeled concept", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("energy-visibility")!);
    expect(chapter.getByText("Energy experience concept")).toBeInTheDocument();
    expect(chapter.getByRole("img")).toHaveAttribute("src", "/images/work/smart-home/story/energy-visibility.webp");
  });

  it("Chapter 5 stages room-by-room expansion", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("expand-carefully")!);
    expect(chapter.getByText("Bedroom")).toBeInTheDocument();
    expect(chapter.getByText("Wider Home")).toBeInTheDocument();
  });

  it("Chapter 7 (Home Resources) covers maintenance/water and keeps insurance/service wording future-direction", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("home-resources")!);
    expect(chapter.getByText("Household awareness concept")).toBeInTheDocument();
    expect(chapter.getByText("Bike insurance renewal")).toBeInTheDocument();
    expect(chapter.getByText("Haircut / grooming reminder")).toBeInTheDocument();
    const text = chapter.getByText(/would not automatically purchase insurance/i);
    expect(text).toBeInTheDocument();
  });

  it("Chapter 8 (Retrofit) never mentions demolition", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("retrofit")!);
    expect(chapter.getByText("Existing Home")).toBeInTheDocument();
    expect((chapter.getByText("Existing Home").closest("section") ?? document.body).textContent?.toLowerCase()).not.toContain("demolition");
  });

  it("Chapter 9 (Safety) is dark-toned and states all eight safety principles", () => {
    render(<SmartHomeEngineeringStoryPage />);
    expect(document.getElementById("safety")).toHaveAttribute("data-tone", "dark");
    const chapter = within(document.getElementById("safety")!);
    expect(chapter.getByText("Qualified electrician for electrical work")).toBeInTheDocument();
    expect(chapter.getByText("Manual override, always available")).toBeInTheDocument();
  });

  it("Chapter 10 states the honest Raspberry Pi 5 / ESP32 prototype wording", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("engineering-foundation")!);
    expect(chapter.getByText(/Raspberry Pi 5 as an edge gateway foundation for early experimentation/i)).toBeInTheDocument();
    expect(chapter.getByText(/ESP32-based experiments remain limited to appropriate low-voltage contexts/i)).toBeInTheDocument();
  });

  it("Chapter 11 states intelligence-after-reliability, human as final decision point", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("intelligence")!);
    expect(chapter.getByText("AI should never replace deterministic safety, manual control or clearly defined electrical behaviour.")).toBeInTheDocument();
    expect(chapter.getByText("The human remains the final decision point.")).toBeInTheDocument();
  });

  it("Chapter 13 (Whole-Home) is labeled a concept visualization, not a completed installation", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("whole-home")!);
    expect(chapter.getByText("Whole-home concept visualization")).toBeInTheDocument();
    expect(chapter.getByRole("img")).toHaveAttribute("src", "/images/work/smart-home/story/whole-home.webp");
  });

  it("Chapter 14 clearly separates current prototype from future direction", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const chapter = within(document.getElementById("current-vs-future")!);
    expect(chapter.getByText("Prototype / Current Exploration")).toBeInTheDocument();
    expect(chapter.getByText("Future Direction")).toBeInTheDocument();
    expect(chapter.getByText("Carefully bounded AI assistance")).toBeInTheDocument();
  });

  it("uses no more than two dark sections", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const darkSections = Array.from(document.querySelectorAll('section[data-tone="dark"]'));
    const ids = darkSections.map((el) => el.id).filter((id) => id !== "cta");
    expect(ids.length).toBeLessThanOrEqual(2);
  });

  it("offers Explore Arooraa Smart Home and Start a Project on the final CTA", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getAllByRole("link", { name: "Start a Project" }).length).toBeGreaterThan(0);
    expect(cta.getAllByRole("link", { name: "Explore Arooraa Smart Home" }).length).toBeGreaterThan(0);
    for (const link of cta.getAllByRole("link", { name: "Explore Arooraa Smart Home" })) {
      expect(link).toHaveAttribute("href", "/products/smart-home-eb");
    }
  });

  it("never claims commercial deployment, certification or an already-finished whole-home installation", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /available now/i,
      /buy now/i,
      /in stock/i,
      /commercially available/i,
      /is certified/i,
      /certified by/i,
      /Raspberry Pi partnership/i,
      /already (fully )?automated/i,
      /trusted by/i,
      /testimonial/i,
      /case stud/i,
      /\d+\+?\s*(customers|clients|users|installations)/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("never claims automatic insurance purchasing or autonomous mains control without safeguards", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/automatically purchases insurance/i);
    expect(text).not.toMatch(/automatically selects the best policy/i);
  });

  it("does not fabricate clients, testimonials, metrics or results, and never mentions Marion", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const pattern of [/award/i, /Marion/, /\$\d/]) {
      expect(text).not.toMatch(pattern);
    }
    expect(text).not.toMatch(/₹/);
  });

  it("does not expose wiring, pinouts, MQTT/network internals or other implementation detail", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const text = (document.body.textContent ?? "").toLowerCase();
    for (const term of ["mqtt", "wiring", "pinout", "relay", "ct ratio", "bill of materials", "kafka", "redis", "postgres"]) {
      expect(text).not.toContain(term);
    }
  });

  it("uses each of the five supplied Smart Home images exactly once", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const images = screen.getAllByRole("img");
    const sources = images.map((img) => img.getAttribute("src"));
    for (const src of [
      "/images/work/smart-home/story/hero.webp",
      "/images/work/smart-home/story/energy-visibility.webp",
      "/images/work/smart-home/story/manual-control.webp",
      "/images/work/smart-home/story/maintenance-water.webp",
      "/images/work/smart-home/story/whole-home.webp",
    ]) {
      expect(sources.filter((s) => s === src)).toHaveLength(1);
    }
  });

  it("does not accidentally bleed in MESA, Mindra or Smart Mirror content", () => {
    render(<SmartHomeEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const term of ["waiter", "kitchen table", "guest journey", "second brain", "My Space", "Family Space", "Mirror State", "Ambient Glance"]) {
      expect(text).not.toContain(term);
    }
  });
});
