import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkHero } from "@/components/work/WorkHero";
import { WorkIntro } from "@/components/work/WorkIntro";
import { FeaturedWorkStory } from "@/components/work/FeaturedWorkStory";
import { MesaWorkVisual } from "@/components/work/mesa/MesaWorkVisual";
import { MesaJourneyBand } from "@/components/work/mesa/MesaJourneyBand";
import { MindraWorkVisual } from "@/components/work/mindra/MindraWorkVisual";
import { PhysicalProductsTransition } from "@/components/work/PhysicalProductsTransition";
import { SmartMirrorWorkVisual } from "@/components/work/smart-mirror/SmartMirrorWorkVisual";
import { SmartHomeWorkVisual } from "@/components/work/smart-home/SmartHomeWorkVisual";
import { CrossProjectQuestionsSection } from "@/components/work/CrossProjectQuestionsSection";
import { EngineeringRangeVisual } from "@/components/work/EngineeringRangeVisual";
import { WorkPrinciples } from "@/components/work/WorkPrinciples";
import { WorkFinalCta } from "@/components/work/WorkFinalCta";
import {
  ENGINEERING_RANGE_HEADING,
  MESA_WORK_STORY,
  MINDRA_WORK_STORY,
  SMART_HOME_WORK_STORY,
  SMART_MIRROR_WORK_STORY,
} from "@/lib/content/our-work";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Our Work — Product Engineering Portfolio | AROORAA",
  description:
    "AROORAA's own product engineering work — MESA, Mindra, Smart Mirror and Arooraa Smart Home — restaurant technology, personal productivity technology, ambient computing and smart-home products, each explained through the problem, product thinking and engineering behind it.",
  path: "/our-work",
});

export default function OurWorkPage() {
  return (
    <main>
      <WorkHero />
      <WorkIntro />

      <FeaturedWorkStory
        story={MESA_WORK_STORY}
        visual={<MesaWorkVisual />}
        variant="flagship"
        band={<MesaJourneyBand />}
      />

      <FeaturedWorkStory story={MINDRA_WORK_STORY} visual={<MindraWorkVisual />} variant="standard" reverse />

      <PhysicalProductsTransition />

      <FeaturedWorkStory story={SMART_MIRROR_WORK_STORY} visual={<SmartMirrorWorkVisual />} variant="cinematic" />

      <FeaturedWorkStory story={SMART_HOME_WORK_STORY} visual={<SmartHomeWorkVisual />} variant="standard" />

      <CrossProjectQuestionsSection />

      <Section id="engineering-range" spacing="default">
        <Container width="wide">
          <SectionHeading
            eyebrow={ENGINEERING_RANGE_HEADING.eyebrow}
            title={ENGINEERING_RANGE_HEADING.title}
            description={ENGINEERING_RANGE_HEADING.description}
          />
          <EngineeringRangeVisual />
        </Container>
      </Section>

      <WorkPrinciples />

      <WorkFinalCta />
    </main>
  );
}
