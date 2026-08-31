import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service/ServicePageTemplate";
import { ProductAssemblyVisual } from "@/components/services/product-engineering/ProductAssemblyVisual";
import { ProductCollaborationVisual } from "@/components/services/product-engineering/ProductCollaborationVisual";
import { ProductTeamAssemblyVisual } from "@/components/services/product-engineering/ProductTeamAssemblyVisual";
import { PRODUCT_ENGINEERING_SERVICE_PAGE } from "@/lib/content/service-pages";

export const metadata: Metadata = {
  title: "Product Engineering Services | AROORAA",
  description:
    "AROORAA designs and engineers web, mobile and platform products — architecture, backend and frontend engineering, mobile, security, quality and cloud foundations — from product direction through production-ready software.",
};

export default function ProductEngineeringServicePage() {
  return (
    <ServicePageTemplate
      content={PRODUCT_ENGINEERING_SERVICE_PAGE}
      sectionVisuals={{
        businessProblem: <ProductTeamAssemblyVisual />,
        outcomes: <ProductAssemblyVisual />,
        collaboration: <ProductCollaborationVisual />,
      }}
    />
  );
}
