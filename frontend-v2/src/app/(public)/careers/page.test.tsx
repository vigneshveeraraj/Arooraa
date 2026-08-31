import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import CareersPage from "./page";
import { CAREER_FAMILIES } from "@/lib/careers/families";
import { JOBS } from "@/lib/careers/jobs";
import { CAREERS_HERO, HIRING_PROCESS_CONTENT, RECRUITMENT_SAFETY_CONTENT } from "@/lib/content/careers";
import { PRODUCTS } from "@/lib/content/products";

describe("Careers page", () => {
  it("renders the hero headline and both CTAs", () => {
    render(<CareersPage />);
    expect(screen.getByRole("heading", { level: 1, name: CAREERS_HERO.headline })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Open Roles" })).toHaveAttribute("href", "#open-roles");
    expect(screen.getByRole("link", { name: "How We Work" })).toHaveAttribute("href", "#how-we-work");
  });

  it("renders the job search toolbar", () => {
    render(<CareersPage />);
    expect(screen.getByLabelText(/search by role, skill or keyword/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Team")).toBeInTheDocument();
  });

  it("renders all six career families with distinct names", () => {
    render(<CareersPage />);
    for (const family of CAREER_FAMILIES) {
      expect(screen.getByRole("heading", { name: family.name })).toBeInTheDocument();
    }
  });

  it("shows the current-openings section with a real, dynamically computed open count", () => {
    render(<CareersPage />);
    expect(screen.getByRole("heading", { name: "Current openings" })).toBeInTheDocument();
    // All six current roles are OPEN — the count must reflect the real dataset,
    // never a separately hardcoded "6 open roles".
    expect(screen.getByText("6 open roles")).toBeInTheDocument();
  });

  it("lists all six approved roles as current openings, each linking to its own detail page", () => {
    render(<CareersPage />);
    for (const job of JOBS) {
      expect(screen.getAllByText(job.title).length).toBeGreaterThan(0);
      expect(screen.getAllByRole("link", { name: new RegExp(job.title) })[0]).toHaveAttribute(
        "href",
        `/careers/${job.slug}`,
      );
    }
    // No card is tagged with the (now unused) "planned" status label.
    expect(screen.queryByText("Planned — not yet open")).not.toBeInTheDocument();
  });

  it("shows a derived open-role count for every career family", () => {
    render(<CareersPage />);
    for (const family of CAREER_FAMILIES) {
      const heading = screen.getByRole("heading", { name: family.name });
      expect(within(heading.closest("li")!).getByText("1 open role")).toBeInTheDocument();
    }
  });

  it("explains the hiring process without promising a fixed number of rounds for every role", () => {
    render(<CareersPage />);
    expect(screen.getByRole("heading", { name: "What to expect" })).toBeInTheDocument();
    for (const step of HIRING_PROCESS_CONTENT.steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    }
    expect(screen.getAllByText(/exact process may vary by role/i).length).toBeGreaterThan(0);
  });

  it("includes the recruitment-safety notice", () => {
    render(<CareersPage />);
    expect(screen.getByText(RECRUITMENT_SAFETY_CONTENT.body)).toBeInTheDocument();
  });

  it("only references the real, approved AROORAA products", () => {
    render(<CareersPage />);
    for (const product of PRODUCTS) {
      expect(screen.getAllByText(product.name).length).toBeGreaterThan(0);
    }
  });

  it("never shows fabricated hiring-volume, applicant-count or employee metrics", () => {
    render(<CareersPage />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/\d+\s*applicants?/i);
    expect(body).not.toMatch(/people viewing/i);
    expect(body).not.toMatch(/only \d+ positions? left/i);
    expect(body).not.toMatch(/great place to work/i);
    expect(body).not.toMatch(/Marion/);
  });

  it("never shows a salary, equity or benefits figure", () => {
    render(<CareersPage />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/₹|\$\s?\d|LPA|per annum|salary range/i);
    expect(body).not.toMatch(/stock options?|equity grant|shares? (of|in) the company/i);
    expect(body).not.toMatch(/health insurance|paid leave|joining bonus/i);
  });
});
