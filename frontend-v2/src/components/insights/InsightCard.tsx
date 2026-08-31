import Link from "next/link";
import type { InsightArticle } from "@/lib/insights/types";
import { INSIGHT_CATEGORY_LABELS } from "@/lib/insights/types";
import { CATEGORY_ACCENTS } from "@/lib/insights/category-accents";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/insights/reading-time";
import { formatArticleDate } from "@/lib/insights/format-date";
import styles from "./InsightCard.module.css";

interface InsightCardProps {
  article: InsightArticle;
}

/**
 * One article card — used on the index's filtered grid, the Latest Insights
 * rail and an article's Related Insights list (Phase 8/9/12), so every
 * article-card surface in Insights stays visually identical.
 */
export function InsightCard({ article }: InsightCardProps) {
  const accent = CATEGORY_ACCENTS[article.category];
  const minutes = estimateReadingMinutes(article.content);

  return (
    <Link href={`/insights/${article.slug}`} className={styles.card}>
      <span className={styles.category} style={{ color: accent.color, background: accent.background }}>
        {INSIGHT_CATEGORY_LABELS[article.category]}
      </span>

      <h3 className={`text-h4 ${styles.title}`}>{article.title}</h3>
      <p className={`text-body-sm ${styles.excerpt}`}>{article.excerpt}</p>

      <div className={styles.footer}>
        <time dateTime={article.publishedDate} className={`text-label ${styles.meta}`}>
          {formatArticleDate(article.publishedDate)}
        </time>
        <span className={`text-label ${styles.meta}`}>{formatReadingTime(minutes)}</span>
        <span className={styles.cta}>
          Read Article <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
