import { LEGAL_NAME, SITE_LOGO_PATH, SITE_NAME, SITE_URL } from "./site";

/**
 * W4.1 Phase 11 — only factual, confirmed fields (name/url/logo). No
 * address, phone, founder details or sameAs profiles until those are
 * actually approved and live — see Phase 2/11's explicit "do not invent" list.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: LEGAL_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_LOGO_PATH}`,
  };
}

interface ArticleJsonLdInput {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  publishedDate: string;
  updatedDate?: string;
  authorLabel: string;
}

export function articleJsonLd(article: ArticleJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle,
    description: article.seoDescription,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate ?? article.publishedDate,
    author: { "@type": "Organization", name: article.authorLabel },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}${SITE_LOGO_PATH}` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/${article.slug}`,
  };
}
