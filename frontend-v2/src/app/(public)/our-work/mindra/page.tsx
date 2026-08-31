import type { Metadata } from "next";
import { WorkDetailHero } from "@/components/work-detail/WorkDetailHero";
import { WorkDetailChapter } from "@/components/work-detail/WorkDetailChapter";
import { WorkDetailCta } from "@/components/work-detail/WorkDetailCta";
import { MindraFragmentsHeroVisual } from "@/components/work-detail/mindra/MindraFragmentsHeroVisual";
import { FragmentedDayVisual } from "@/components/work-detail/mindra/FragmentedDayVisual";
import { CaptureContextVisual } from "@/components/work-detail/mindra/CaptureContextVisual";
import { SpacesVisual } from "@/components/work-detail/mindra/SpacesVisual";
import { NaturalCaptureVisual } from "@/components/work-detail/mindra/NaturalCaptureVisual";
import { TodayBentoVisual } from "@/components/work-detail/mindra/TodayBentoVisual";
import { DayWithMindraStoryboard } from "@/components/work-detail/mindra/DayWithMindraStoryboard";
import { LifeMaintenanceVisual } from "@/components/work-detail/mindra/LifeMaintenanceVisual";
import { MobileWebVisual } from "@/components/work-detail/mindra/MobileWebVisual";
import { PrivateToSharedVisual } from "@/components/work-detail/mindra/PrivateToSharedVisual";
import { EngineeringFoundationVisual } from "@/components/work-detail/mindra/EngineeringFoundationVisual";
import { MindraFutureDirectionTransition } from "@/components/work-detail/mindra/MindraFutureDirectionTransition";
import { MindraClosingStory } from "@/components/work-detail/mindra/MindraClosingStory";
import {
  CHAPTER_CAPTURE_CONTEXT,
  CHAPTER_DAY_WITH_MINDRA,
  CHAPTER_ENGINEERING_FOUNDATION,
  CHAPTER_FRAGMENTED_DAY,
  CHAPTER_LIFE_MAINTENANCE,
  CHAPTER_MOBILE_WEB,
  CHAPTER_NATURAL_CAPTURE,
  CHAPTER_SPACES,
  CHAPTER_TODAY,
  CHAPTER_TRUST_PRIVACY,
  MINDRA_STORY_FINAL_CTA,
  MINDRA_STORY_HERO,
  MINDRA_STORY_RELATED_LINKS,
} from "@/lib/content/work-detail/mindra";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Mindra Product Story | AROORAA",
  description:
    "Explore how AROORAA shaped Mindra, a personal and family second brain for capturing, organizing and remembering everyday life, personal work and shared family coordination across mobile and web.",
  path: "/our-work/mindra",
});

export default function MindraEngineeringStoryPage() {
  return (
    <main>
      <WorkDetailHero
        eyebrow={MINDRA_STORY_HERO.eyebrow}
        title={MINDRA_STORY_HERO.title}
        supporting={MINDRA_STORY_HERO.supporting}
        maturityLabel={MINDRA_STORY_HERO.maturityLabel}
        primaryCta={MINDRA_STORY_HERO.primaryCta}
        secondaryCta={MINDRA_STORY_HERO.secondaryCta}
        visual={<MindraFragmentsHeroVisual />}
      />

      <WorkDetailChapter {...CHAPTER_FRAGMENTED_DAY}>
        <FragmentedDayVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_CAPTURE_CONTEXT}>
        <CaptureContextVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_SPACES}>
        <SpacesVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_NATURAL_CAPTURE}>
        <NaturalCaptureVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_TODAY}>
        <TodayBentoVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_DAY_WITH_MINDRA}>
        <DayWithMindraStoryboard />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_LIFE_MAINTENANCE}>
        <LifeMaintenanceVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_MOBILE_WEB}>
        <MobileWebVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_TRUST_PRIVACY} tone="dark">
        <PrivateToSharedVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ENGINEERING_FOUNDATION}>
        <EngineeringFoundationVisual />
      </WorkDetailChapter>

      <MindraFutureDirectionTransition />

      <MindraClosingStory />

      <WorkDetailCta
        title={MINDRA_STORY_FINAL_CTA.title}
        supporting={MINDRA_STORY_FINAL_CTA.supporting}
        primary={MINDRA_STORY_FINAL_CTA.primary}
        secondary={MINDRA_STORY_FINAL_CTA.secondary}
        relatedLinks={MINDRA_STORY_RELATED_LINKS}
      />
    </main>
  );
}
