import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service/ServicePageTemplate";
import { PlatformFlowVisual } from "@/components/services/cloud-platform/PlatformFlowVisual";
import { EnvironmentPromotionVisual } from "@/components/services/cloud-platform/EnvironmentPromotionVisual";
import { PlatformApproachVisual } from "@/components/services/cloud-platform/PlatformApproachVisual";
import { CLOUD_PLATFORM_SERVICE_PAGE } from "@/lib/content/service-pages";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Cloud & Platform Engineering Services | AROORAA",
  description:
    "AROORAA designs cloud, deployment and platform foundations — cloud architecture, CI/CD engineering, infrastructure as code, observability and reliability engineering — that help products deploy reliably and operate with confidence.",
  path: "/services/cloud-platform",
});

export default function CloudPlatformServicePage() {
  return (
    <ServicePageTemplate
      content={CLOUD_PLATFORM_SERVICE_PAGE}
      sectionVisuals={{
        transformation: <PlatformFlowVisual />,
        intelligenceSystem: <EnvironmentPromotionVisual />,
        approach: <PlatformApproachVisual />,
      }}
    />
  );
}
