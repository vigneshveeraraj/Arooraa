import { getRelatedArticles } from "@/lib/insights/articles";
import { ARTICLE_META_CONTENT } from "@/lib/content/insights";
import { InsightCard } from "../InsightCard";
import styles from "./RelatedInsights.module.css";

interface RelatedInsightsProps {
  currentSlug: string;
}

/** 2–3 related stories (Phase 12) — always excludes the current article. */
export function RelatedInsights({ currentSlug }: RelatedInsightsProps) {
  const related = getRelatedArticles(currentSlug);
  if (related.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <h2 className="text-h3">{ARTICLE_META_CONTENT.relatedHeading}</h2>
      <ul className={styles.grid}>
        {related.map((article) => (
          <li key={article.slug}>
            <InsightCard article={article} />
          </li>
        ))}
      </ul>
    </div>
  );
}
