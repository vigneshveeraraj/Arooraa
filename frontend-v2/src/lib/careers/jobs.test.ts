import { describe, expect, it } from "vitest";
import { getAllJobs, getAllSlugs, getJobBySlug, getOpenJobs, getPlannedJobs, getRelatedJobs, JOBS } from "./jobs";

const APPROVED_SLUGS = [
  "ai-engineer",
  "java-full-stack-engineer",
  "react-frontend-engineer",
  "ui-ux-product-designer",
  "sales-business-development",
  "marketing-growth-executive",
];

describe("careers job dataset", () => {
  it("contains exactly the six approved initial roles", () => {
    expect(getAllSlugs().sort()).toEqual([...APPROVED_SLUGS].sort());
  });

  it("has unique slugs", () => {
    expect(new Set(getAllSlugs()).size).toBe(JOBS.length);
  });

  it("marks every current role OPEN — these are genuine current AROORAA openings", () => {
    for (const job of JOBS) {
      expect(job.status).toBe("OPEN");
    }
  });

  it("computes the open count from the data — all six roles today", () => {
    expect(getOpenJobs()).toHaveLength(6);
    expect(getPlannedJobs()).toHaveLength(0);
  });

  it("never invents a work mode, employment type or experience value", () => {
    for (const job of JOBS) {
      expect(job.workMode).toBeUndefined();
      expect(job.employmentType).toBeUndefined();
      expect(job.experience).toBeUndefined();
      expect(job.postedAt).toBeUndefined();
    }
  });

  it("uses the same confirmed hiring location for every role", () => {
    for (const job of JOBS) {
      expect(job.location).toBe("Chennai, Tamil Nadu, India");
    }
  });

  it("resolves a job by slug", () => {
    expect(getJobBySlug("ai-engineer")?.title).toBe("AI Engineer");
    expect(getJobBySlug("does-not-exist")).toBeUndefined();
  });

  it("excludes the current job from its own related-roles list", () => {
    const related = getRelatedJobs("ai-engineer");
    expect(related.some((job) => job.slug === "ai-engineer")).toBe(false);
    expect(related.length).toBeGreaterThan(0);
  });

  it("getAllJobs returns the full dataset", () => {
    expect(getAllJobs()).toHaveLength(6);
  });
});
