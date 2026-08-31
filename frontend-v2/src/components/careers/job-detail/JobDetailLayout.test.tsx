import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobDetailLayout } from "./JobDetailLayout";
import { JOBS } from "@/lib/careers/jobs";
import type { JobOpening } from "@/lib/careers/types";

describe("JobDetailLayout", () => {
  it.each(JOBS)("renders $slug with its title, team, summary sections and role philosophy", (job) => {
    render(<JobDetailLayout job={job} />);

    expect(screen.getAllByRole("heading", { level: 1 })[0]).toHaveTextContent(job.title);
    expect(screen.getAllByText(job.location).length).toBeGreaterThan(0);
    expect(screen.getByText("About the role")).toBeInTheDocument();
    expect(screen.getByText(job.aboutTheRole)).toBeInTheDocument();
    expect(screen.getByText("What you'll work on")).toBeInTheDocument();
    for (const item of job.responsibilities) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    expect(screen.getByText("What we're looking for")).toBeInTheDocument();
    expect(screen.getByText("How we think about this role")).toBeInTheDocument();
    expect(screen.getByText(job.howWeThinkAboutThisRole)).toBeInTheDocument();
  });

  const firstJob = JOBS[0]!;

  it("never renders an Apply CTA for a PLANNED role — shows the planning notice and a Job Alerts link instead", () => {
    const plannedJob: JobOpening = { ...firstJob, status: "PLANNED" };
    render(<JobDetailLayout job={plannedJob} />);

    expect(screen.queryByRole("button", { name: /apply for this role/i })).not.toBeInTheDocument();
    expect(screen.getByText("This role is in the planning stage.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /join job alerts/i })).toHaveAttribute("href", "/careers#talent-community");
  });

  it("renders a real Apply CTA for an OPEN role — every current role is OPEN today", () => {
    render(<JobDetailLayout job={firstJob} />);

    expect(firstJob.status).toBe("OPEN");
    expect(screen.getAllByRole("button", { name: /apply for this role/i }).length).toBeGreaterThan(0);
  });

  it("shows a closed notice and related roles for a CLOSED role, never an Apply CTA", () => {
    const closedJob: JobOpening = { ...firstJob, status: "CLOSED" };
    render(<JobDetailLayout job={closedJob} />);

    expect(screen.queryByRole("button", { name: /apply for this role/i })).not.toBeInTheDocument();
    expect(screen.getByText("This role is no longer accepting applications.")).toBeInTheDocument();
    expect(screen.getByText("Other roles worth a look")).toBeInTheDocument();
  });

  it("lists related roles that exclude the current slug", () => {
    render(<JobDetailLayout job={firstJob} />);
    expect(screen.getByText("Other roles worth a look")).toBeInTheDocument();
    const relatedTitles = JOBS.slice(1)
      .filter((j) => j.status !== "CLOSED")
      .slice(0, 3)
      .map((j) => j.title);
    for (const title of relatedTitles) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }
  });
});
