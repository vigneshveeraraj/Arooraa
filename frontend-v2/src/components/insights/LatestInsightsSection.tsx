import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { getLatestArticles } from "@/lib/insights/articles";
import { LATEST_INSIGHTS_CONTENT } from "@/lib/content/insights";
import { InsightCard } from "./InsightCard";
import styles from "./LatestInsightsSection.module.css";

export function LatestInsightsSection() {
  const articles = getLatestArticles();
  if (articles.length === 0) return null;

  return (
    <Section spacing="compact">
      <Container>
        <p className="text-eyebrow">{LATEST_INSIGHTS_CONTENT.eyebrow}</p>
        <h2 className={`text-h2 ${styles.title}`}>{LATEST_INSIGHTS_CONTENT.title}</h2>
        <ul className={styles.grid}>
          {articles.map((article) => (
            <li key={article.slug}>
              <InsightCard article={article} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
