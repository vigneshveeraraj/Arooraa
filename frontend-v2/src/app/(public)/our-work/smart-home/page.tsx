import type { Metadata } from "next";
import { WorkDetailHero } from "@/components/work-detail/WorkDetailHero";
import { WorkDetailChapter } from "@/components/work-detail/WorkDetailChapter";
import { WorkDetailCta } from "@/components/work-detail/WorkDetailCta";
import { SmartHomeHeroVisual } from "@/components/work-detail/smart-home/SmartHomeHeroVisual";
import { HouseholdConcernsVisual } from "@/components/work-detail/smart-home/HouseholdConcernsVisual";
import { NormalHomeStatesVisual } from "@/components/work-detail/smart-home/NormalHomeStatesVisual";
import { LocalFirstVisual } from "@/components/work-detail/smart-home/LocalFirstVisual";
import { EnergyVisibilityVisual } from "@/components/work-detail/smart-home/EnergyVisibilityVisual";
import { ExpansionVisual } from "@/components/work-detail/smart-home/ExpansionVisual";
import { ManualControlVisual } from "@/components/work-detail/smart-home/ManualControlVisual";
import { HomeResourcesVisual } from "@/components/work-detail/smart-home/HomeResourcesVisual";
import { RetrofitVisual } from "@/components/work-detail/smart-home/RetrofitVisual";
import { SafetyVisual } from "@/components/work-detail/smart-home/SafetyVisual";
import { EngineeringFoundationVisual } from "@/components/work-detail/smart-home/EngineeringFoundationVisual";
import { IntelligenceVisual } from "@/components/work-detail/smart-home/IntelligenceVisual";
import { PrototypeJourneyVisual } from "@/components/work-detail/smart-home/PrototypeJourneyVisual";
import { WholeHomeVisual } from "@/components/work-detail/smart-home/WholeHomeVisual";
import { CurrentVsFutureVisual } from "@/components/work-detail/smart-home/CurrentVsFutureVisual";
import { SmartHomeClosingStory } from "@/components/work-detail/smart-home/SmartHomeClosingStory";
import {
  CHAPTER_CURRENT_VS_FUTURE,
  CHAPTER_ENERGY_VISIBILITY,
  CHAPTER_ENGINEERING_FOUNDATION,
  CHAPTER_EXPAND_CAREFULLY,
  CHAPTER_HOME_RESOURCES,
  CHAPTER_INTELLIGENCE,
  CHAPTER_LOCAL_FIRST,
  CHAPTER_MANUAL_CONTROL,
  CHAPTER_NORMAL_HOME,
  CHAPTER_PROTOTYPE_JOURNEY,
  CHAPTER_REAL_PROBLEM,
  CHAPTER_RETROFIT,
  CHAPTER_SAFETY,
  CHAPTER_WHOLE_HOME,
  SMART_HOME_STORY_FINAL_CTA,
  SMART_HOME_STORY_HERO,
  SMART_HOME_STORY_RELATED_LINKS,
} from "@/lib/content/work-detail/smart-home";

export const metadata: Metadata = {
  title: "Arooraa Smart Home Product Story | AROORAA",
  description:
    "How AROORAA is exploring a local-first smart home — energy visibility, manual-control coexistence, retrofit-friendly modernization and safety-led automation. A Raspberry Pi 5 prototype direction, not a commercially available product.",
};

export default function SmartHomeEngineeringStoryPage() {
  return (
    <main>
      <WorkDetailHero
        eyebrow={SMART_HOME_STORY_HERO.eyebrow}
        title={SMART_HOME_STORY_HERO.title}
        supporting={SMART_HOME_STORY_HERO.supporting}
        maturityLabel={SMART_HOME_STORY_HERO.maturityLabel}
        primaryCta={SMART_HOME_STORY_HERO.primaryCta}
        secondaryCta={SMART_HOME_STORY_HERO.secondaryCta}
        visual={<SmartHomeHeroVisual />}
        visualWeight="wide"
      />

      <WorkDetailChapter {...CHAPTER_REAL_PROBLEM}>
        <HouseholdConcernsVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_NORMAL_HOME} width="content">
        <NormalHomeStatesVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_LOCAL_FIRST} width="content">
        <LocalFirstVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ENERGY_VISIBILITY}>
        <EnergyVisibilityVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_EXPAND_CAREFULLY}>
        <ExpansionVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_MANUAL_CONTROL}>
        <ManualControlVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_HOME_RESOURCES}>
        <HomeResourcesVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_RETROFIT}>
        <RetrofitVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_SAFETY} tone="dark">
        <SafetyVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ENGINEERING_FOUNDATION}>
        <EngineeringFoundationVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_INTELLIGENCE} width="content">
        <IntelligenceVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_PROTOTYPE_JOURNEY} width="content">
        <PrototypeJourneyVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_WHOLE_HOME}>
        <WholeHomeVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_CURRENT_VS_FUTURE} width="content">
        <CurrentVsFutureVisual />
      </WorkDetailChapter>

      <SmartHomeClosingStory />

      <WorkDetailCta
        title={SMART_HOME_STORY_FINAL_CTA.title}
        supporting={SMART_HOME_STORY_FINAL_CTA.supporting}
        primary={SMART_HOME_STORY_FINAL_CTA.primary}
        secondary={SMART_HOME_STORY_FINAL_CTA.secondary}
        relatedLinks={SMART_HOME_STORY_RELATED_LINKS}
      />
    </main>
  );
}
