import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service/ServicePageTemplate";
import { AiHeroVisual } from "@/components/services/ai-automation/AiHeroVisual";
import { AiTransformationVisual } from "@/components/services/ai-automation/AiTransformationVisual";
import { AiCollaborationVisual } from "@/components/services/ai-automation/AiCollaborationVisual";
import { AiSystemVisual } from "@/components/services/ai-automation/AiSystemVisual";
import { AiApproachSequenceVisual } from "@/components/services/ai-automation/AiApproachSequenceVisual";
import { AiInnovationVisual } from "@/components/services/ai-automation/AiInnovationVisual";
import { AI_AUTOMATION_SERVICE_PAGE } from "@/lib/content/service-pages";

export const metadata: Metadata = {
  title: "AI, Data & Automation Services | AROORAA",
  description:
    "AROORAA helps businesses identify where AI, data and automation create practical value, then designs and engineers the systems needed to make that intelligence useful and reliable.",
};

export default function AiAutomationServicePage() {
  return (
    <ServicePageTemplate
      content={AI_AUTOMATION_SERVICE_PAGE}
      heroLayout="balanced"
      sectionVisuals={{
        hero: <AiHeroVisual />,
        transformation: <AiTransformationVisual />,
        collaboration: <AiCollaborationVisual />,
        intelligenceSystem: <AiSystemVisual />,
        approach: <AiApproachSequenceVisual />,
        innovation: <AiInnovationVisual />,
      }}
    />
  );
}
