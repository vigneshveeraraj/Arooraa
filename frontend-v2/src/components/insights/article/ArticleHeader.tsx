import Link from "next/link";
import type { InsightArticle } from "@/lib/insights/types";
import { INSIGHT_CATEGORY_LABELS } from "@/lib/insights/types";
import { CATEGORY_ACCENTS } from "@/lib/insights/category-accents";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/insights/reading-time";
import { formatArticleDate } from "@/lib/insights/format-date";
import { ARTICLE_META_CONTENT } from "@/lib/content/insights";
import styles from "./ArticleHeader.module.css";

interface ArticleHeaderProps {
  article: InsightArticle;
}

/**
 * Breadcrumb, category, H1, deck and meta row for an article page (Phase
 * 10) — one H1 on the page, logical heading order underneath it (Phase 19).
 */
export function ArticleHeader({ article }: ArticleHeaderProps) {
  const accent = CATEGORY_ACCENTS[article.category];
  const minutes = estimateReadingMinutes(article.content);

  return (
    <header className={styles.header}>
      <nav aria-label="Breadcrumb">
        <Link href="/insights" className={styles.breadcrumb}>
          <span aria-hidden="true">← </span>
          {ARTICLE_META_CONTENT.breadcrumbHome}
        </Link>
      </nav>

      <span className={styles.category} style={{ color: accent.color, background: accent.background }}>
        {INSIGHT_CATEGORY_LABELS[article.category]}
      </span>

      <h1 className={`text-h1 ${styles.title}`}>{article.title}</h1>
      <p className={`text-body-lg ${styles.excerpt}`}>{article.excerpt}</p>

      <div className={styles.meta}>
        <time dateTime={article.publishedDate} className="text-label">
          {formatArticleDate(article.publishedDate)}
        </time>
        <span className="text-label">{formatReadingTime(minutes)}</span>
        <span className="text-label">
          {ARTICLE_META_CONTENT.authorPrefix} {article.authorLabel}
        </span>
      </div>
    </header>
  );
}
