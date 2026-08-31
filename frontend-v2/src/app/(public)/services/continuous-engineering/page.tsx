import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service/ServicePageTemplate";
import { ContinuousPulseVisual } from "@/components/services/continuous-engineering/ContinuousPulseVisual";
import { ProductHealthVisual } from "@/components/services/continuous-engineering/ProductHealthVisual";
import { OperatingLoopVisual } from "@/components/services/continuous-engineering/OperatingLoopVisual";
import { CONTINUOUS_ENGINEERING_SERVICE_PAGE } from "@/lib/content/service-pages";

export const metadata: Metadata = {
  title: "Continuous Engineering Services | AROORAA",
  description:
    "AROORAA provides engineering-led ongoing support for digital products in production — reliability improvements, issue resolution, release support, quality hardening and continuous product evolution.",
};

export default function ContinuousEngineeringServicePage() {
  return (
    <ServicePageTemplate
      content={CONTINUOUS_ENGINEERING_SERVICE_PAGE}
      sectionVisuals={{
        hero: <ContinuousPulseVisual />,
        outcomes: <ProductHealthVisual />,
        approach: <OperatingLoopVisual />,
      }}
    />
  );
}
