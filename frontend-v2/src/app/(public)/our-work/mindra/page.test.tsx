import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import MindraEngineeringStoryPage from "./page";

describe("Mindra Product Story page", () => {
  it("renders with exactly one h1 and the approved hero content", () => {
    render(<MindraEngineeringStoryPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Remember less. Live with more clarity.");
    expect(screen.getByText("AROORAA PRODUCT STORY · MINDRA")).toBeInTheDocument();
    expect(screen.getAllByText("WORKING PRODUCT · MVP").length).toBeGreaterThan(0);
  });

  it("offers the Explore Mindra and Start a Project hero CTAs", () => {
    render(<MindraEngineeringStoryPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore Mindra" })).toHaveAttribute("href", "/products/mindra");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("renders all ten numbered chapters, the future-direction transition and the closing story, in order", () => {
    render(<MindraEngineeringStoryPage />);
    const ids = [
      "fragmented-day",
      "capture-context",
      "spaces",
      "natural-capture",
      "today",
      "day-with-mindra",
      "life-maintenance",
      "mobile-web",
      "trust-privacy",
      "engineering-foundation",
      "future-direction",
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

  it("Chapter 01 tells the fragmentation story with the mental-load-in-the-gaps idea", () => {
    render(<MindraEngineeringStoryPage />);
    const chapter = within(document.getElementById("fragmented-day")!);
    expect(
      chapter.getByRole("heading", { name: "The problem was not remembering one thing. It was remembering everything in different places." }),
    ).toBeInTheDocument();
    expect(chapter.getByText("The mental load often lives in the gaps between tools.")).toBeInTheDocument();
    for (const item of ["Notes", "Tasks", "Saved Links", "Groceries", "Family Plans", "Reminders"]) {
      expect(chapter.getByText(item)).toBeInTheDocument();
    }
  });

  it("distinguishes My Space and Family Space with real explanatory text beside the image", () => {
    render(<MindraEngineeringStoryPage />);
    const chapter = within(document.getElementById("spaces")!);
    expect(chapter.getByRole("heading", { name: "Personal life and shared family life need different boundaries." })).toBeInTheDocument();
    expect(chapter.getByText("My Space")).toBeInTheDocument();
    expect(chapter.getByText("Family Space")).toBeInTheDocument();
    expect(chapter.getByRole("img")).toBeInTheDocument();
  });

  it("Chapter 04 names Notes, Tasks, Bookmarks and Contacts as current capture types", () => {
    render(<MindraEngineeringStoryPage />);
    const chapter = within(document.getElementById("natural-capture")!);
    for (const label of ["Notes", "Tasks", "Bookmarks", "Contacts"]) {
      expect(chapter.getByText(label)).toBeInTheDocument();
    }
  });

  it("Today brings together groceries, meal planning and family coordination without fake analytics", () => {
    render(<MindraEngineeringStoryPage />);
    const chapter = within(document.getElementById("today")!);
    for (const label of ["Today", "Grocery", "Meal Plan", "Family"]) {
      expect(chapter.getByText(label)).toBeInTheDocument();
    }
    expect(document.getElementById("today")!.textContent).not.toMatch(/\d+%/);
  });

  it("Life Maintenance groups Vehicle, Home, Personal and Renewals, labeled as concept direction", () => {
    render(<MindraEngineeringStoryPage />);
    const chapter = within(document.getElementById("life-maintenance")!);
    for (const group of ["Vehicle", "Home", "Personal", "Renewals"]) {
      expect(chapter.getByText(group)).toBeInTheDocument();
    }
    expect(chapter.getByText("Concept direction")).toBeInTheDocument();
  });

  it("Mobile + Web tells the cross-device continuity story", () => {
    render(<MindraEngineeringStoryPage />);
    const chapter = within(document.getElementById("mobile-web")!);
    expect(chapter.getByText("One Mindra. One memory. Available across your devices.")).toBeInTheDocument();
    expect(chapter.getByText("Mobile")).toBeInTheDocument();
    expect(chapter.getByText("Web")).toBeInTheDocument();
  });

  it("Trust/Privacy is the page's one dark story chapter", () => {
    render(<MindraEngineeringStoryPage />);
    expect(document.getElementById("trust-privacy")).toHaveAttribute("data-tone", "dark");
    for (const id of [
      "fragmented-day",
      "capture-context",
      "spaces",
      "natural-capture",
      "today",
      "day-with-mindra",
      "life-maintenance",
      "mobile-web",
      "engineering-foundation",
    ]) {
      expect(document.getElementById(id)).toHaveAttribute("data-tone", "light");
    }
  });

  it("separates current-vs-future direction clearly, in both the capture chapter and the engineering close", () => {
    render(<MindraEngineeringStoryPage />);
    const capture = within(document.getElementById("natural-capture")!);
    expect(capture.getByText("Future direction")).toBeInTheDocument();
    expect(capture.getByText("Voice capture")).toBeInTheDocument();

    const future = within(document.getElementById("future-direction")!);
    expect(future.getByText("Available / Current Foundation")).toBeInTheDocument();
    expect(future.getByText("Future Direction")).toBeInTheDocument();
    expect(future.getByText("My Space")).toBeInTheDocument();
    expect(future.getByText("Richer voice interaction")).toBeInTheDocument();
  });

  it("the engineering chapter stays public-safe (capability-level language, not internal architecture)", () => {
    render(<MindraEngineeringStoryPage />);
    const chapter = within(document.getElementById("engineering-foundation")!);
    for (const layer of ["Identity", "Search", "APIs", "Sync / State", "Notifications"]) {
      expect(chapter.getByText(layer)).toBeInTheDocument();
    }
  });

  it("offers Explore Mindra and Start a Project on the final CTA", () => {
    render(<MindraEngineeringStoryPage />);
    const cta = within(document.getElementById("cta")!);
    for (const link of cta.getAllByRole("link", { name: "Start a Project" })) {
      expect(link).toHaveAttribute("href", "/start-project");
    }
    expect(cta.getAllByRole("link", { name: "Explore Mindra" }).length).toBeGreaterThan(0);
    expect(cta.getByRole("link", { name: "Product Engineering" })).toHaveAttribute("href", "/services/product-engineering");
  });

  it("never presents insurance automation or automatic purchase as current capability", () => {
    render(<MindraEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/would not automatically buy insurance/);
    expect(text).not.toMatch(/automatically buys insurance/);
    expect(text).not.toMatch(/automatically chooses the best policy/);
  });

  it("does not fabricate clients, testimonials, metrics or results, and never mentions Marion", () => {
    render(<MindraEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const pattern of [/trusted by/i, /testimonial/i, /case stud/i, /certified by/i, /award/i, /Marion/, /\d+%/, /\$\d/]) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not expose confidential implementation terminology", () => {
    render(<MindraEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const term of ["redis", "kafka", "postgres", "spring boot", "react native", "expo", "repository", "database schema"]) {
      expect(text.toLowerCase()).not.toContain(term);
    }
  });

  it("uses each of the three supplied story images exactly once", () => {
    render(<MindraEngineeringStoryPage />);
    const images = screen.getAllByRole("img");
    const sources = images.map((img) => img.getAttribute("src"));
    expect(sources.filter((src) => src === "/images/work/mindra/story/mobile-web.webp")).toHaveLength(1);
    expect(sources.filter((src) => src === "/images/work/mindra/story/life-maintenance.webp")).toHaveLength(1);
    expect(sources.filter((src) => src === "/images/work/mindra/story/private-today-family.webp")).toHaveLength(1);
  });

  it("does not accidentally bleed in MESA's restaurant vocabulary", () => {
    render(<MindraEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const term of ["restaurant", "waiter", "kitchen", "MESA", "table"]) {
      expect(text).not.toContain(term);
    }
  });

  it("does not publish an indicative price range", () => {
    render(<MindraEngineeringStoryPage />);
    expect(document.body.textContent ?? "").not.toMatch(/₹/);
  });
});
