import type { Metadata } from "next";
import { LEGAL_NAME, SITE_NAME, SITE_URL } from "@/lib/seo/site";

/**
 * W4.1 — brand-level defaults, split out of layout.tsx so this can be unit
 * tested without pulling in next/font/google (which errors outside an actual
 * Next.js build/dev run). Individual pages set their own title, description,
 * canonical (`alternates.canonical`) and Open Graph preview via
 * `lib/seo/metadata.ts#pageMetadata` — this is only the fallback for a page
 * that omits its own, and the shared openGraph/twitter/robots shape every
 * page inherits from. No `title.template` here deliberately: every indexable
 * page already ships a complete, unique "Page Name | AROORAA" title as a
 * plain string, and a template would double-append the suffix.
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AROORAA — Product Engineering & Innovation",
  description:
    "AROORAA Technologies Private Limited turns ideas and business problems into production-ready digital products — product engineering, AI and automation, and connected physical products.",
  applicationName: SITE_NAME,
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
  },
};
