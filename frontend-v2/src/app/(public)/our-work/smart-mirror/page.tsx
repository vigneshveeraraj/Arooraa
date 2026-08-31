import type { Metadata } from "next";
import { WorkDetailHero } from "@/components/work-detail/WorkDetailHero";
import { WorkDetailChapter } from "@/components/work-detail/WorkDetailChapter";
import { WorkDetailCta } from "@/components/work-detail/WorkDetailCta";
import { SmartMirrorHeroVisual } from "@/components/work-detail/smart-mirror/SmartMirrorHeroVisual";
import { InteractionContrastVisual } from "@/components/work-detail/smart-mirror/InteractionContrastVisual";
import { MirrorStateStudyVisual } from "@/components/work-detail/smart-mirror/MirrorStateStudyVisual";
import { HomeConceptVisual } from "@/components/work-detail/smart-mirror/HomeConceptVisual";
import { GymConceptVisual } from "@/components/work-detail/smart-mirror/GymConceptVisual";
import { SalonConceptVisual } from "@/components/work-detail/smart-mirror/SalonConceptVisual";
import { HospitalityConceptVisual } from "@/components/work-detail/smart-mirror/HospitalityConceptVisual";
import { EnvironmentsSynthesisVisual } from "@/components/work-detail/smart-mirror/EnvironmentsSynthesisVisual";
import { AttentionHierarchyVisual } from "@/components/work-detail/smart-mirror/AttentionHierarchyVisual";
import { DayRhythmStoryboard } from "@/components/work-detail/smart-mirror/DayRhythmStoryboard";
import { PhysicalProductVisual } from "@/components/work-detail/smart-mirror/PhysicalProductVisual";
import { EdgeFoundationVisual } from "@/components/work-detail/smart-mirror/EdgeFoundationVisual";
import { PrivacyBoundaryVisual } from "@/components/work-detail/smart-mirror/PrivacyBoundaryVisual";
import { EngineeringCrossSectionVisual } from "@/components/work-detail/smart-mirror/EngineeringCrossSectionVisual";
import { PrototypeVsFutureVisual } from "@/components/work-detail/smart-mirror/PrototypeVsFutureVisual";
import { SmartMirrorClosingStory } from "@/components/work-detail/smart-mirror/SmartMirrorClosingStory";
import {
  CHAPTER_ATTENTION,
  CHAPTER_DAY_RHYTHM,
  CHAPTER_EDGE_FOUNDATION,
  CHAPTER_ENGINEERING_PROOF,
  CHAPTER_ENVIRONMENTS,
  CHAPTER_GYM,
  CHAPTER_HOME,
  CHAPTER_HOSPITALITY,
  CHAPTER_INTERACTION_CONTRAST,
  CHAPTER_MIRROR_FIRST,
  CHAPTER_PHYSICAL_PRODUCT,
  CHAPTER_PRIVACY,
  CHAPTER_PROTOTYPE_VS_FUTURE,
  CHAPTER_SALON,
  SMART_MIRROR_STORY_FINAL_CTA,
  SMART_MIRROR_STORY_HERO,
  SMART_MIRROR_STORY_RELATED_LINKS,
} from "@/lib/content/work-detail/smart-mirror";

export const metadata: Metadata = {
  title: "Smart Mirror Product Story | AROORAA",
  description:
    "How AROORAA explored ambient computing through Smart Mirror — a physical product concept and Raspberry Pi 5 prototype foundation exploring edge computing, connected-home experience and physical product engineering. Concept and prototype direction, not a commercially available product.",
};

export default function SmartMirrorEngineeringStoryPage() {
  return (
    <main>
      <WorkDetailHero
        eyebrow={SMART_MIRROR_STORY_HERO.eyebrow}
        title={SMART_MIRROR_STORY_HERO.title}
        supporting={SMART_MIRROR_STORY_HERO.supporting}
        maturityLabel={SMART_MIRROR_STORY_HERO.maturityLabel}
        primaryCta={SMART_MIRROR_STORY_HERO.primaryCta}
        secondaryCta={SMART_MIRROR_STORY_HERO.secondaryCta}
        visual={<SmartMirrorHeroVisual />}
        visualWeight="wide"
      />

      <WorkDetailChapter {...CHAPTER_INTERACTION_CONTRAST} actLabel="ACT I — WHY">
        <InteractionContrastVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_MIRROR_FIRST} width="content">
        <MirrorStateStudyVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_HOME} actLabel="ACT II — ONE MIRROR, DIFFERENT CONTEXTS">
        <HomeConceptVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_GYM}>
        <GymConceptVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_SALON}>
        <SalonConceptVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_HOSPITALITY}>
        <HospitalityConceptVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ENVIRONMENTS} width="content">
        <EnvironmentsSynthesisVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ATTENTION} actLabel="ACT III — DESIGNING AMBIENT COMPUTING" width="content">
        <AttentionHierarchyVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_DAY_RHYTHM}>
        <DayRhythmStoryboard />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_PHYSICAL_PRODUCT} actLabel="ACT IV — FROM INTERFACE TO PHYSICAL PRODUCT">
        <PhysicalProductVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_EDGE_FOUNDATION} width="content">
        <EdgeFoundationVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_PRIVACY} tone="dark" actLabel="ACT V — TRUST">
        <PrivacyBoundaryVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ENGINEERING_PROOF} actLabel="ACT VI — ENGINEERING PROOF">
        <EngineeringCrossSectionVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_PROTOTYPE_VS_FUTURE} actLabel="ACT VII — CURRENT PROTOTYPE VS FUTURE">
        <PrototypeVsFutureVisual />
      </WorkDetailChapter>

      <SmartMirrorClosingStory />

      <WorkDetailCta
        title={SMART_MIRROR_STORY_FINAL_CTA.title}
        supporting={SMART_MIRROR_STORY_FINAL_CTA.supporting}
        primary={SMART_MIRROR_STORY_FINAL_CTA.primary}
        secondary={SMART_MIRROR_STORY_FINAL_CTA.secondary}
        relatedLinks={SMART_MIRROR_STORY_RELATED_LINKS}
      />
    </main>
  );
}
