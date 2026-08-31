import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { SmartMirrorHeroVisual } from "@/components/products/smart-mirror/SmartMirrorHeroVisual";
import { SmartMirrorMomentsRow } from "@/components/products/smart-mirror/SmartMirrorMomentsRow";
import { SmartMirrorScatteredToCalm } from "@/components/products/smart-mirror/SmartMirrorScatteredToCalm";
import { SmartMirrorDashboard } from "@/components/products/smart-mirror/SmartMirrorDashboard";
import { SmartMirrorDayStory } from "@/components/products/smart-mirror/SmartMirrorDayStory";
import { SmartMirrorPersonalFamilyVisual } from "@/components/products/smart-mirror/SmartMirrorPersonalFamilyVisual";
import { SmartMirrorPrivacyVisual } from "@/components/products/smart-mirror/SmartMirrorPrivacyVisual";
import { SmartMirrorEngineeringVisual } from "@/components/products/smart-mirror/SmartMirrorEngineeringVisual";
import { SMART_MIRROR_PRODUCT_PAGE } from "@/lib/content/products";

export const metadata: Metadata = {
  title: "Smart Mirror — Ambient AI for Everyday Life | AROORAA",
  description:
    "Smart Mirror is AROORAA's upcoming ambient-AI smart mirror concept — personal intelligence, family coordination and connected-home information built into an everyday object. Coming Soon.",
};

export default function SmartMirrorProductPage() {
  return (
    <ProductPageTemplate
      content={SMART_MIRROR_PRODUCT_PAGE}
      heroVisual={<SmartMirrorHeroVisual />}
      stackedVisualSections={["experience", "engineering"]}
      sectionVisuals={{
        whyWeBuiltIt: <SmartMirrorMomentsRow />,
        theProblem: <SmartMirrorScatteredToCalm />,
        whatItDoes: <SmartMirrorDashboard />,
        experience: <SmartMirrorDayStory />,
        howItWorks: <SmartMirrorPersonalFamilyVisual />,
        trust: <SmartMirrorPrivacyVisual />,
        engineering: <SmartMirrorEngineeringVisual />,
      }}
    />
  );
}
