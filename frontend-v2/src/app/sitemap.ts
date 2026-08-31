import type { MetadataRoute } from "next";
import { getOpenJobs } from "@/lib/careers/jobs";
import { getAllArticles } from "@/lib/insights/articles";
import { SITE_URL } from "@/lib/seo/site";

// Required for output:"export" — no per-request data, safe to prerender once.
export const dynamic = "force-static";

const STATIC_ROUTES = [
  "/",
  "/products",
  "/products/mesa",
  "/products/mindra",
  "/products/smart-mirror",
  "/products/smart-home-eb",
  "/services",
  "/services/product-discovery",
  "/services/product-engineering",
  "/services/ai-automation",
  "/services/application-modernization",
  "/services/cloud-platform",
  "/services/continuous-engineering",
  "/our-work",
  "/our-work/mesa",
  "/our-work/mindra",
  "/our-work/smart-mirror",
  "/our-work/smart-home",
  "/about",
  "/start-project",
  "/careers",
  "/contact",
  "/insights",
];

/**
 * W4.1 Phase 6 — every indexable public route, admin/design-system
 * deliberately excluded (Phase 7 keeps them out of robots too). No
 * fabricated `lastModified`: static marketing pages and job postings have no
 * genuinely tracked last-modified date, so they're omitted entirely rather
 * than defaulting to build time or an invented date (Phase 6's "use factual
 * last-modified information only when reliably known"). Insight articles do
 * carry real authored dates, so those alone get a `lastModified`. Only OPEN
 * roles are listed (Phase 18) — CLOSED/PLANNED jobs still render their own
 * page (for direct links already shared) but are not indexable.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const jobEntries: MetadataRoute.Sitemap = getOpenJobs().map((job) => ({
    url: `${SITE_URL}/careers/${job.slug}`,
  }));

  const articleEntries: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${SITE_URL}/insights/${article.slug}`,
    lastModified: article.updatedDate ?? article.publishedDate,
  }));

  return [...staticEntries, ...jobEntries, ...articleEntries];
}
