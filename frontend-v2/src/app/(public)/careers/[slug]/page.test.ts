import { describe, expect, it } from "vitest";
import { generateMetadata } from "./page";
import { getAllJobs } from "@/lib/careers/jobs";

describe("career role metadata", () => {
  it("gives every role its own canonical URL and title", async () => {
    for (const job of getAllJobs()) {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: job.slug }) });
      expect(metadata.alternates?.canonical).toBe(`/careers/${job.slug}`);
      expect(metadata.title).toBe(`${job.title} | Careers at AROORAA`);
    }
  });

  it("returns empty metadata for an unknown slug rather than fabricating one", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "does-not-exist" }) });
    expect(metadata).toEqual({});
  });
});
