import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

// Required for output:"export" — no per-request data, safe to prerender once.
export const dynamic = "force-static";

/**
 * W4.1 Phase 7 — allows the public site, blocks admin and the internal
 * design-system review page from being crawled. This is a courtesy for
 * well-behaved crawlers only, not a security boundary: admin routes are
 * actually protected by session auth in SecurityConfig on the backend, and
 * every admin page additionally ships its own noindex/nofollow metadata
 * (Phase 8) so it can't appear in results even if a link to it leaks.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/design-system"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
