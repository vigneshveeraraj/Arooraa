import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import type { InsightArticle } from "@/lib/insights/types";
import { InsightClosingCta } from "../InsightClosingCta";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleBody } from "./ArticleBody";
import { RelatedInsights } from "./RelatedInsights";

interface ArticleDetailLayoutProps {
  article: InsightArticle;
}

/**
 * Single source of markup for an Insights article page (Phase 10). Kept to
 * the "content" container width throughout, not the marketing-page maximum
 * width — long-form reading measure over section-to-section, per §10.
 */
export function ArticleDetailLayout({ article }: ArticleDetailLayoutProps) {
  return (
    <main>
      <Section spacing="compact">
        <Container width="content">
          <ArticleHeader article={article} />
        </Container>
      </Section>

      <Section spacing="none">
        <Container width="content">
          <ArticleBody article={article} />
        </Container>
      </Section>

      <Section spacing="default">
        <Container width="content">
          <RelatedInsights currentSlug={article.slug} />
        </Container>
      </Section>

      <InsightClosingCta content={article.closingCta} />
    </main>
  );
}
