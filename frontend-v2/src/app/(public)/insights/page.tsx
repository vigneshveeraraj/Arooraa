import type { Metadata } from "next";
import { InsightsHero } from "@/components/insights/InsightsHero";
import { FeaturedInsightStory } from "@/components/insights/FeaturedInsightStory";
import { LatestInsightsSection } from "@/components/insights/LatestInsightsSection";
import { InsightsExplorer } from "@/components/insights/InsightsExplorer";
import { InsightClosingCta } from "@/components/insights/InsightClosingCta";
import { INSIGHTS_CLOSING_CTA } from "@/lib/content/insights";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Insights | AROORAA",
  description:
    "Ideas, engineering, and the problems worth solving. Notes from AROORAA on product engineering, AI, connected products, restaurant technology, smart-home thinking and founder observations.",
  path: "/insights",
});

export default function InsightsPage() {
  return (
    <main>
      <InsightsHero />
      <FeaturedInsightStory />
      <LatestInsightsSection />
      <InsightsExplorer />
      <InsightClosingCta content={INSIGHTS_CLOSING_CTA} />
    </main>
  );
}
