import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { SmartHomeHeroVisual } from "@/components/products/smart-home/SmartHomeHeroVisual";
import { SmartHomeEnergyInsightVisual } from "@/components/products/smart-home/SmartHomeEnergyInsightVisual";
import { SmartHomeLocalFirstVisual } from "@/components/products/smart-home/SmartHomeLocalFirstVisual";
import { SmartHomeOverviewVisual } from "@/components/products/smart-home/SmartHomeOverviewVisual";
import { SmartHomeManualControlVisual } from "@/components/products/smart-home/SmartHomeManualControlVisual";
import { SmartHomeWaterVisual } from "@/components/products/smart-home/SmartHomeWaterVisual";
import { SmartHomeSafetyVisual } from "@/components/products/smart-home/SmartHomeSafetyVisual";
import { SmartHomeEngineeringVisual } from "@/components/products/smart-home/SmartHomeEngineeringVisual";
import { SmartHomeJourneyVisual } from "@/components/products/smart-home/SmartHomeJourneyVisual";
import { SMART_HOME_PRODUCT_PAGE } from "@/lib/content/products";

export const metadata: Metadata = {
  title: "Arooraa Smart Home — Local-First Smart Home Prototype | AROORAA",
  description:
    "Arooraa Smart Home is a local-first, retrofit-friendly smart home prototype exploring home energy monitoring, water protection and dependable automation that keeps manual control intact. Prototype in development.",
};

export default function SmartHomeProductPage() {
  return (
    <ProductPageTemplate
      content={SMART_HOME_PRODUCT_PAGE}
      heroVisual={<SmartHomeHeroVisual />}
      stackedVisualSections={["theProblem", "overview", "experience", "engineering"]}
      sectionVisuals={{
        theProblem: <SmartHomeEnergyInsightVisual />,
        productVision: <SmartHomeLocalFirstVisual />,
        overview: <SmartHomeOverviewVisual />,
        experience: <SmartHomeManualControlVisual />,
        howItWorks: <SmartHomeWaterVisual />,
        trust: <SmartHomeSafetyVisual />,
        engineering: <SmartHomeEngineeringVisual />,
        whereWereGoing: <SmartHomeJourneyVisual />,
      }}
    />
  );
}
