import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrentOpeningsSection } from "./CurrentOpeningsSection";
import type { JobOpening } from "@/lib/careers/types";

const OPEN_FIXTURE: JobOpening[] = [
  {
    id: "a",
    slug: "ai-engineer",
    title: "AI Engineer",
    team: "AI_DATA",
    location: "Chennai, Tamil Nadu, India",
    summary: "Build AI capabilities.",
    aboutTheRole: "about",
    responsibilities: ["r1"],
    qualifications: ["q1"],
    skills: ["Python", "RAG"],
    howWeThinkAboutThisRole: "how",
    status: "OPEN",
  },
  {
    id: "b",
    slug: "java-full-stack-engineer",
    title: "Java Full Stack Engineer",
    team: "ENGINEERING",
    location: "Chennai, Tamil Nadu, India",
    summary: "Build the backend and web app.",
    aboutTheRole: "about",
    responsibilities: ["r1"],
    qualifications: ["q1"],
    skills: ["Java", "Spring Boot"],
    howWeThinkAboutThisRole: "how",
    status: "OPEN",
  },
];

describe("CurrentOpeningsSection", () => {
  it("shows all six real openings with the dynamically computed count", () => {
    render(<CurrentOpeningsSection />);
    expect(screen.getByText("6 open roles")).toBeInTheDocument();
    expect(screen.getByText("AI Engineer")).toBeInTheDocument();
    expect(screen.getByText("Marketing & Growth Executive")).toBeInTheDocument();
  });

  it("shows an honest zero-open-roles state when the dataset has no open jobs", () => {
    render(<CurrentOpeningsSection jobs={[]} />);
    expect(screen.getByText("No open roles right now")).toBeInTheDocument();
    expect(screen.getByText("There are no open roles published right now.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get job alerts/i })).toHaveAttribute("href", "#talent-community");
  });

  it("computes the results count from the job list, not a hardcoded number", () => {
    render(<CurrentOpeningsSection jobs={OPEN_FIXTURE} />);
    expect(screen.getByText("2 open roles")).toBeInTheDocument();
    expect(screen.getByText("AI Engineer")).toBeInTheDocument();
    expect(screen.getByText("Java Full Stack Engineer")).toBeInTheDocument();
  });

  it("filters results by keyword", async () => {
    const user = userEvent.setup();
    render(<CurrentOpeningsSection jobs={OPEN_FIXTURE} />);

    await user.type(screen.getByLabelText(/search by role, skill or keyword/i), "java");

    expect(screen.getByText("1 open role")).toBeInTheDocument();
    expect(screen.getByText("Java Full Stack Engineer")).toBeInTheDocument();
    expect(screen.queryByText("AI Engineer")).not.toBeInTheDocument();
  });

  it("filters results by team", async () => {
    const user = userEvent.setup();
    render(<CurrentOpeningsSection jobs={OPEN_FIXTURE} />);

    await user.selectOptions(screen.getByLabelText("Team"), "AI_DATA");

    expect(screen.getByText("AI Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Java Full Stack Engineer")).not.toBeInTheDocument();
  });

  it("shows a filtered empty state with clear-filters and job-alerts pathways when a real result set exists but the filter excludes everything", async () => {
    const user = userEvent.setup();
    render(<CurrentOpeningsSection jobs={OPEN_FIXTURE} />);

    await user.type(screen.getByLabelText(/search by role, skill or keyword/i), "zzz-no-such-role");

    expect(screen.getByText("No roles match those filters right now.")).toBeInTheDocument();
    const clearButton = screen.getByRole("button", { name: /clear filters/i });
    expect(screen.getByRole("link", { name: /get job alerts/i })).toBeInTheDocument();

    await user.click(clearButton);
    expect(screen.getByText("2 open roles")).toBeInTheDocument();
  });
});
