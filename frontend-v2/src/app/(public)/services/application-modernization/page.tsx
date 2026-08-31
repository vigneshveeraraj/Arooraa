import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service/ServicePageTemplate";
import { ModernizationTransformationVisual } from "@/components/services/application-modernization/ModernizationTransformationVisual";
import { ModernizationDecisionsVisual } from "@/components/services/application-modernization/ModernizationDecisionsVisual";
import { ModernizationStrategyVisual } from "@/components/services/application-modernization/ModernizationStrategyVisual";
import { APPLICATION_MODERNIZATION_SERVICE_PAGE } from "@/lib/content/service-pages";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Application Modernization Services | AROORAA",
  description:
    "AROORAA helps businesses modernize legacy and difficult-to-change applications — architecture refactoring, software and Java modernization, API modernization and cloud-ready delivery — without losing valuable business logic.",
  path: "/services/application-modernization",
});

export default function ApplicationModernizationServicePage() {
  return (
    <ServicePageTemplate
      content={APPLICATION_MODERNIZATION_SERVICE_PAGE}
      sectionVisuals={{
        transformation: (
          <>
            <ModernizationTransformationVisual />
            <ModernizationDecisionsVisual />
          </>
        ),
        approach: <ModernizationStrategyVisual />,
      }}
    />
  );
}
