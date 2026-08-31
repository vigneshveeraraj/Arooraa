import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";
import { HERO_CONTENT, PRODUCTS_SNAPSHOT_HEADING } from "@/lib/content/home";
import { PROBLEMS_HEADING, SERVICES_HEADING } from "@/lib/content/services";
import { FEATURED_WORK_HEADING } from "@/lib/content/work";
import { HOW_WE_WORK_HEADING } from "@/lib/content/process";
import { ENGINEERING_HEADING } from "@/lib/content/engineering";
import { STORIES_HEADING } from "@/lib/content/stories";
import { WHY_AROORAA_HEADING } from "@/lib/content/why-arooraa";
import { AURA_HEADING } from "@/lib/content/aura";
import { FINAL_CTA_CONTENT } from "@/lib/content/cta";

describe("Home page", () => {
  it("renders the eleven frozen sections in the required order", () => {
    render(<Home />);

    const headings = screen
      .getAllByRole("heading")
      .filter((heading) => heading.tagName === "H1" || heading.tagName === "H2")
      .map((heading) => heading.textContent);

    expect(headings).toEqual([
      HERO_CONTENT.headline,
      PRODUCTS_SNAPSHOT_HEADING.title,
      PROBLEMS_HEADING.title,
      SERVICES_HEADING.title,
      FEATURED_WORK_HEADING.title,
      HOW_WE_WORK_HEADING.title,
      ENGINEERING_HEADING.title,
      STORIES_HEADING.title,
      WHY_AROORAA_HEADING.title,
      AURA_HEADING.title,
      FINAL_CTA_CONTENT.title,
    ]);
  });
});
