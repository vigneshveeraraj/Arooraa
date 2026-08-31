import type { Metadata } from "next";
import { WorkDetailHero } from "@/components/work-detail/WorkDetailHero";
import { WorkDetailChapter } from "@/components/work-detail/WorkDetailChapter";
import { WorkDetailCta } from "@/components/work-detail/WorkDetailCta";
import { MesaStoryHeroVisual } from "@/components/work-detail/mesa/MesaStoryHeroVisual";
import { GuestVsOperationsVisual } from "@/components/work-detail/mesa/GuestVsOperationsVisual";
import { FragmentationToConnectedVisual } from "@/components/work-detail/mesa/FragmentationToConnectedVisual";
import { TableOrbitVisual } from "@/components/work-detail/mesa/TableOrbitVisual";
import { RolePerspectiveStoryboard } from "@/components/work-detail/mesa/RolePerspectiveStoryboard";
import { ProductDecisionSequence } from "@/components/work-detail/mesa/ProductDecisionSequence";
import { MealTimelineVisual } from "@/components/work-detail/mesa/MealTimelineVisual";
import { MesaEcosystemTransition } from "@/components/work-detail/mesa/MesaEcosystemTransition";
import { EngineeringSynchronizationVisual } from "@/components/work-detail/mesa/EngineeringSynchronizationVisual";
import { EdgeCaseDisturbanceVisual } from "@/components/work-detail/mesa/EdgeCaseDisturbanceVisual";
import { FrontAndOperationsOverlapVisual } from "@/components/work-detail/mesa/FrontAndOperationsOverlapVisual";
import { CapabilityLandscapeVisual } from "@/components/work-detail/mesa/CapabilityLandscapeVisual";
import { EvolutionLoopVisual } from "@/components/work-detail/mesa/EvolutionLoopVisual";
import { ScopeBoundaryVisual } from "@/components/work-detail/mesa/ScopeBoundaryVisual";
import { EngineeringStackVisual } from "@/components/work-detail/mesa/EngineeringStackVisual";
import { MaturityStatement } from "@/components/work-detail/mesa/MaturityStatement";
import { ProofCapabilitiesVisual } from "@/components/work-detail/mesa/ProofCapabilitiesVisual";
import {
  CHAPTER_BOUNDARY,
  CHAPTER_ECOSYSTEM,
  CHAPTER_EDGE_CASES,
  CHAPTER_ENGINEERING_STACK,
  CHAPTER_ENGINEERING_SYNC,
  CHAPTER_EVOLUTION,
  CHAPTER_FRAGMENTATION,
  CHAPTER_GUEST_VS_OPERATIONS,
  CHAPTER_MATURITY,
  CHAPTER_MEAL_TIMELINE,
  CHAPTER_PRODUCT_DECISIONS,
  CHAPTER_PROOF,
  CHAPTER_ROLE_PERSPECTIVES,
  CHAPTER_TABLE_ORBIT,
  CHAPTER_UX_OPERATIONS,
  MESA_STORY_FINAL_CTA,
  MESA_STORY_HERO,
  MESA_STORY_RELATED_LINKS,
} from "@/lib/content/work-detail/mesa";

export const metadata: Metadata = {
  title: "MESA Engineering Story | AROORAA",
  description:
    "Explore how AROORAA shaped and engineered MESA, its connected restaurant technology ecosystem, from restaurant workflows and product decisions to production engineering.",
};

export default function MesaEngineeringStoryPage() {
  return (
    <main>
      <WorkDetailHero
        eyebrow={MESA_STORY_HERO.eyebrow}
        title={MESA_STORY_HERO.title}
        supporting={MESA_STORY_HERO.supporting}
        maturityLabel={MESA_STORY_HERO.maturityLabel}
        primaryCta={MESA_STORY_HERO.primaryCta}
        secondaryCta={MESA_STORY_HERO.secondaryCta}
        visual={<MesaStoryHeroVisual />}
        visualWeight="wide"
      />

      <WorkDetailChapter {...CHAPTER_GUEST_VS_OPERATIONS} actLabel="ACT 1 — UNDERSTANDING THE RESTAURANT">
        <GuestVsOperationsVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_FRAGMENTATION}>
        <FragmentationToConnectedVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_TABLE_ORBIT}>
        <TableOrbitVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ROLE_PERSPECTIVES} actLabel="ACT 2 — SHAPING THE PRODUCT">
        <RolePerspectiveStoryboard />
      </WorkDetailChapter>

      <MesaEcosystemTransition />

      <WorkDetailChapter {...CHAPTER_PRODUCT_DECISIONS}>
        <ProductDecisionSequence />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_MEAL_TIMELINE}>
        <MealTimelineVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ENGINEERING_SYNC} tone="dark" actLabel="ACT 3 — ENGINEERING REALITY">
        <EngineeringSynchronizationVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_EDGE_CASES}>
        <EdgeCaseDisturbanceVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_UX_OPERATIONS}>
        <FrontAndOperationsOverlapVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ECOSYSTEM} actLabel="ACT 4 — EVOLVING THE ECOSYSTEM">
        <CapabilityLandscapeVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_EVOLUTION} tone="dark">
        <EvolutionLoopVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_BOUNDARY}>
        <ScopeBoundaryVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_ENGINEERING_STACK}>
        <EngineeringStackVisual />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_MATURITY}>
        <MaturityStatement />
      </WorkDetailChapter>

      <WorkDetailChapter {...CHAPTER_PROOF}>
        <ProofCapabilitiesVisual />
      </WorkDetailChapter>

      <WorkDetailCta
        title={MESA_STORY_FINAL_CTA.title}
        supporting={MESA_STORY_FINAL_CTA.supporting}
        primary={MESA_STORY_FINAL_CTA.primary}
        secondary={MESA_STORY_FINAL_CTA.secondary}
        relatedLinks={MESA_STORY_RELATED_LINKS}
      />
    </main>
  );
}
