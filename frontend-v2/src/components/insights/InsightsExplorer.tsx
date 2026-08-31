"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getAllArticles } from "@/lib/insights/articles";
import { filterArticlesByCategory, formatArticleCount, type InsightCategoryFilter } from "@/lib/insights/filter";
import { INSIGHT_CATEGORY_LABELS, INSIGHT_CATEGORY_ORDER, type InsightArticle } from "@/lib/insights/types";
import { INSIGHTS_EXPLORER_CONTENT } from "@/lib/content/insights";
import { InsightCard } from "./InsightCard";
import styles from "./InsightsExplorer.module.css";

interface InsightsExplorerProps {
  /** Test-only seam — the live page always uses the real getAllArticles() dataset. */
  articles?: InsightArticle[];
}

/**
 * Category filter + "All articles" grid (Phase 8–9). Client-side only — the
 * same reasoning as Careers' team filter: a handful of articles doesn't
 * warrant a search backend, and search itself stays optional here.
 */
export function InsightsExplorer({ articles }: InsightsExplorerProps = {}) {
  const [category, setCategory] = useState<InsightCategoryFilter>("ALL");
  const allArticles = useMemo(() => articles ?? getAllArticles(), [articles]);
  const filteredArticles = useMemo(() => filterArticlesByCategory(allArticles, category), [allArticles, category]);

  return (
    <Section spacing="compact" id="all-insights">
      <Container>
        <p className="text-eyebrow">{INSIGHTS_EXPLORER_CONTENT.eyebrow}</p>
        <h2 className={`text-h2 ${styles.title}`}>{INSIGHTS_EXPLORER_CONTENT.title}</h2>

        <div className={styles.filters} role="group" aria-label={INSIGHTS_EXPLORER_CONTENT.filterLabel}>
          <button
            type="button"
            className={styles.filterButton}
            aria-pressed={category === "ALL"}
            data-active={category === "ALL"}
            onClick={() => setCategory("ALL")}
          >
            {INSIGHTS_EXPLORER_CONTENT.allLabel} ({allArticles.length})
          </button>
          {INSIGHT_CATEGORY_ORDER.map((cat) => {
            const count = allArticles.filter((article) => article.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={styles.filterButton}
                aria-pressed={category === cat}
                data-active={category === cat}
                onClick={() => setCategory(cat)}
              >
                {INSIGHT_CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        <p className={`text-label ${styles.count}`} aria-live="polite">
          {formatArticleCount(filteredArticles.length)}
        </p>

        {filteredArticles.length > 0 ? (
          <ul className={styles.grid}>
            {filteredArticles.map((article) => (
              <li key={article.slug}>
                <InsightCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p className="text-h4">{INSIGHTS_EXPLORER_CONTENT.empty.heading}</p>
            <p className="text-body-sm">{INSIGHTS_EXPLORER_CONTENT.empty.body}</p>
            <Button variant="secondary" onClick={() => setCategory("ALL")}>
              {INSIGHTS_EXPLORER_CONTENT.empty.clearLabel}
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}
