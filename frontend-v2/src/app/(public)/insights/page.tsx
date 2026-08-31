import type { Metadata } from "next";
import { InsightsHero } from "@/components/insights/InsightsHero";
import { FeaturedInsightStory } from "@/components/insights/FeaturedInsightStory";
import { LatestInsightsSection } from "@/components/insights/LatestInsightsSection";
import { InsightsExplorer } from "@/components/insights/InsightsExplorer";
import { InsightClosingCta } from "@/components/insights/InsightClosingCta";
import { INSIGHTS_CLOSING_CTA } from "@/lib/content/insights";

export const metadata: Metadata = {
  title: "Insights | AROORAA",
  description:
    "Ideas, engineering, and the problems worth solving. Notes from AROORAA on product engineering, AI, connected products, restaurant technology, smart-home thinking and founder observations.",
  openGraph: {
    title: "AROORAA Insights",
    description: "Ideas, engineering, and the problems worth solving.",
    type: "website",
  },
};

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
