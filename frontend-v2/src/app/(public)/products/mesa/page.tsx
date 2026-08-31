import type { Metadata } from "next";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { MesaEcosystemVisual } from "@/components/products/mesa/MesaEcosystemVisual";
import { RestaurantFormatsVisual } from "@/components/products/mesa/RestaurantFormatsVisual";
import { RestaurantConnectionStory } from "@/components/products/mesa/RestaurantConnectionStory";
import { MesaCapabilityMap } from "@/components/products/mesa/MesaCapabilityMap";
import { MesaJourneyStrip } from "@/components/products/mesa/MesaJourneyStrip";
import { MesaMaturityProgression } from "@/components/products/mesa/MesaMaturityProgression";
import { MESA_PRODUCT_PAGE } from "@/lib/content/products";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "MESA — Connected Restaurant Technology | AROORAA",
  description:
    "MESA is AROORAA's flagship connected restaurant technology platform — bringing guest experience and restaurant operations together in one system.",
  path: "/products/mesa",
});

export default function MesaProductPage() {
  return (
    <ProductPageTemplate
      content={MESA_PRODUCT_PAGE}
      heroVisual={<MesaEcosystemVisual />}
      sectionVisuals={{
        whyWeBuiltIt: <RestaurantFormatsVisual />,
        theProblem: <RestaurantConnectionStory />,
        whatItDoes: <MesaCapabilityMap />,
        experience: <MesaJourneyStrip />,
        whereWereGoing: <MesaMaturityProgression />,
      }}
    />
  );
}
