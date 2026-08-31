import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { getOpenJobs, getAllJobs } from "@/lib/careers/jobs";
import { getAllArticles } from "@/lib/insights/articles";

describe("sitemap", () => {
  it("uses the production origin for every entry, never localhost", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const url of urls) {
      expect(url.startsWith("https://arooraa.com/")).toBe(true);
    }
  });

  it("includes every core marketing route exactly once", () => {
    const urls = sitemap().map((entry) => entry.url);
    const coreRoutes = [
      "/",
      "/products",
      "/services",
      "/our-work",
      "/about",
      "/start-project",
      "/careers",
      "/contact",
      "/insights",
    ];
    for (const route of coreRoutes) {
      const matches = urls.filter((url) => url === `https://arooraa.com${route}`);
      expect(matches).toHaveLength(1);
    }
  });

  it("includes every product, service and our-work sub-route", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const slug of ["mesa", "mindra", "smart-mirror", "smart-home-eb"]) {
      expect(urls).toContain(`https://arooraa.com/products/${slug}`);
    }
    for (const slug of [
      "product-discovery",
      "product-engineering",
      "ai-automation",
      "application-modernization",
      "cloud-platform",
      "continuous-engineering",
    ]) {
      expect(urls).toContain(`https://arooraa.com/services/${slug}`);
    }
    for (const slug of ["mesa", "mindra", "smart-mirror", "smart-home"]) {
      expect(urls).toContain(`https://arooraa.com/our-work/${slug}`);
    }
  });

  it("includes every OPEN career role and no non-OPEN role", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const job of getOpenJobs()) {
      expect(urls).toContain(`https://arooraa.com/careers/${job.slug}`);
    }
    const nonOpenSlugs = getAllJobs()
      .filter((job) => job.status !== "OPEN")
      .map((job) => job.slug);
    for (const slug of nonOpenSlugs) {
      expect(urls).not.toContain(`https://arooraa.com/careers/${slug}`);
    }
  });

  it("includes every Insights article with its genuine published/updated date", () => {
    const entries = sitemap();
    for (const article of getAllArticles()) {
      const entry = entries.find((e) => e.url === `https://arooraa.com/insights/${article.slug}`);
      expect(entry).toBeDefined();
      expect(entry?.lastModified).toBe(article.updatedDate ?? article.publishedDate);
    }
  });

  it("never lists admin or the internal design-system page", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
    expect(urls.some((url) => url.includes("/design-system"))).toBe(false);
  });
});
