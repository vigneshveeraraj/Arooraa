import type { Metadata } from "next";
import { SITE_NAME } from "./site";

/**
 * W4.1 — shared shape for every indexable page's metadata: a canonical URL
 * and an Open Graph preview that matches the page's own title/description,
 * instead of silently inheriting the homepage's. `path` is root-relative
 * ("/products/mesa") and resolved against the root layout's `metadataBase`.
 */
interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
}

export function pageMetadata({ title, description, path, type = "website", robots }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type,
    },
    ...(robots ? { robots } : {}),
  };
}
