import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service/ServicePageTemplate";
import { ScopeFunnelVisual } from "@/components/services/product-discovery/ScopeFunnelVisual";
import { DiscoverySequenceVisual } from "@/components/services/product-discovery/DiscoverySequenceVisual";
import { DiscoveryDirectionVisual } from "@/components/services/product-discovery/DiscoveryDirectionVisual";
import { PRODUCT_DISCOVERY_SERVICE_PAGE } from "@/lib/content/service-pages";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Product Strategy & Discovery Services | AROORAA",
  description:
    "Product discovery services that turn an idea, business problem or unclear opportunity into a defined MVP, prioritized capabilities and a technical roadmap grounded in real feasibility constraints.",
  path: "/services/product-discovery",
});

export default function ProductDiscoveryServicePage() {
  return (
    <ServicePageTemplate
      content={PRODUCT_DISCOVERY_SERVICE_PAGE}
      sectionVisuals={{
        businessProblem: <DiscoveryDirectionVisual />,
        outcomes: <ScopeFunnelVisual />,
        approach: <DiscoverySequenceVisual />,
      }}
    />
  );
}
