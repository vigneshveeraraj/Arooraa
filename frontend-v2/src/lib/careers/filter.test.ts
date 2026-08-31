import { describe, expect, it } from "vitest";
import { filterJobs } from "./filter";
import type { JobOpening } from "./types";

const FIXTURE_JOBS: JobOpening[] = [
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
  {
    id: "c",
    slug: "marketing-growth-executive",
    title: "Marketing & Growth Executive",
    team: "MARKETING",
    location: "Chennai, Tamil Nadu, India",
    summary: "Help the market understand AROORAA.",
    aboutTheRole: "about",
    responsibilities: ["r1"],
    qualifications: ["q1"],
    skills: ["SEO", "Content"],
    howWeThinkAboutThisRole: "how",
    status: "OPEN",
  },
];

describe("filterJobs", () => {
  it("returns every job when no filters are set", () => {
    expect(filterJobs(FIXTURE_JOBS, { keyword: "", team: "ALL" })).toHaveLength(3);
  });

  it("matches keyword against the job title", () => {
    const result = filterJobs(FIXTURE_JOBS, { keyword: "java", team: "ALL" });
    expect(result.map((j) => j.slug)).toEqual(["java-full-stack-engineer"]);
  });

  it("matches keyword case-insensitively against skill tags", () => {
    const result = filterJobs(FIXTURE_JOBS, { keyword: "python", team: "ALL" });
    expect(result.map((j) => j.slug)).toEqual(["ai-engineer"]);
  });

  it("matches keyword against the team label", () => {
    const result = filterJobs(FIXTURE_JOBS, { keyword: "marketing", team: "ALL" });
    expect(result.map((j) => j.slug)).toEqual(["marketing-growth-executive"]);
  });

  it("filters by team", () => {
    const result = filterJobs(FIXTURE_JOBS, { keyword: "", team: "ENGINEERING" });
    expect(result.map((j) => j.slug)).toEqual(["java-full-stack-engineer"]);
  });

  it("combines keyword and team filters", () => {
    const result = filterJobs(FIXTURE_JOBS, { keyword: "engineer", team: "AI_DATA" });
    expect(result.map((j) => j.slug)).toEqual(["ai-engineer"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterJobs(FIXTURE_JOBS, { keyword: "zzz-no-match", team: "ALL" })).toHaveLength(0);
  });
});
