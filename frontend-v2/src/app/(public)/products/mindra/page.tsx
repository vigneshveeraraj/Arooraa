import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { MindraHeroVisual } from "@/components/products/mindra/MindraHeroVisual";
import { MindraScatteredToStructured } from "@/components/products/mindra/MindraScatteredToStructured";
import { MindraOrganizedLifePreview } from "@/components/products/mindra/MindraOrganizedLifePreview";
import { MindraLifeDashboard } from "@/components/products/mindra/MindraLifeDashboard";
import { MindraSharedSpacesPreview } from "@/components/products/mindra/MindraSharedSpacesPreview";
import { MindraDayStory } from "@/components/products/mindra/MindraDayStory";
import { MindraPrivacyPreview } from "@/components/products/mindra/MindraPrivacyPreview";
import { MINDRA_PRODUCT_PAGE } from "@/lib/content/products";

export const metadata: Metadata = {
  title: "Mindra — Personal & Family Second Brain | AROORAA",
  description:
    "Mindra is a private digital second brain that helps individuals and families capture what matters, remember what needs attention and coordinate everyday life in one calm, structured place.",
};

export default function MindraProductPage() {
  return (
    <ProductPageTemplate
      content={MINDRA_PRODUCT_PAGE}
      heroVisual={<MindraHeroVisual />}
      sectionVisuals={{
        productVision: <MindraOrganizedLifePreview />,
        theProblem: <MindraScatteredToStructured />,
        whatItDoes: <MindraLifeDashboard />,
        howItWorks: <MindraSharedSpacesPreview />,
        experience: <MindraDayStory />,
        trust: <MindraPrivacyPreview />,
      }}
    />
  );
}
