import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { getFeaturedArticle } from "@/lib/insights/articles";
import { INSIGHT_CATEGORY_LABELS } from "@/lib/insights/types";
import { CATEGORY_ACCENTS } from "@/lib/insights/category-accents";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/insights/reading-time";
import { formatArticleDate } from "@/lib/insights/format-date";
import { FEATURED_STORY_CONTENT } from "@/lib/content/insights";
import styles from "./FeaturedInsightStory.module.css";

/**
 * The single featured story (Phase 8) — always derived from the article
 * dataset's own `featured` flag, never a separately hardcoded duplicate of
 * whichever article is meant to lead the index.
 */
export function FeaturedInsightStory() {
  const article = getFeaturedArticle();
  const accent = CATEGORY_ACCENTS[article.category];
  const minutes = estimateReadingMinutes(article.content);

  return (
    <Section spacing="compact">
      <Container>
        <p className="text-eyebrow">{FEATURED_STORY_CONTENT.eyebrow}</p>
        <Link href={`/insights/${article.slug}`} className={styles.card}>
          <div className={styles.visual} style={{ background: accent.background }} aria-hidden="true">
            <span className={styles.visualLines} style={{ borderColor: accent.color }} />
            <span className={styles.visualCategory} style={{ color: accent.color }}>
              {INSIGHT_CATEGORY_LABELS[article.category]}
            </span>
          </div>

          <div className={styles.body}>
            <span className={styles.category} style={{ color: accent.color, background: accent.background }}>
              {INSIGHT_CATEGORY_LABELS[article.category]}
            </span>
            <h2 className={`text-h1 ${styles.title}`}>{article.title}</h2>
            <p className={`text-body-lg ${styles.excerpt}`}>{article.excerpt}</p>
            <div className={styles.meta}>
              <time dateTime={article.publishedDate} className="text-label">
                {formatArticleDate(article.publishedDate)}
              </time>
              <span className="text-label">{formatReadingTime(minutes)}</span>
            </div>
            <span className={styles.cta}>
              Read Article <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      </Container>
    </Section>
  );
}
