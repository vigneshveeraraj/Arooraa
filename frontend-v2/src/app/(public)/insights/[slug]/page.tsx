import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getArticleBySlug } from "@/lib/insights/articles";
import { ArticleDetailLayout } from "@/components/insights/article/ArticleDetailLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd } from "@/lib/seo/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const base = pageMetadata({
    title: article.seoTitle,
    description: article.seoDescription,
    path: `/insights/${article.slug}`,
    type: "article",
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate ?? article.publishedDate,
    },
  };
}

export default async function InsightArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      {/* Static, build-time-only JSON-LD (no user input reaches this string). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
      <ArticleDetailLayout article={article} />
    </>
  );
}
