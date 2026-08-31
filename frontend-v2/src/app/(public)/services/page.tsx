import type { Metadata } from "next";
import { ServicesHero } from "@/components/services/ServicesHero";
import { SixServicesGrid } from "@/components/services/SixServicesGrid";
import { ServicesProblemLed } from "@/components/services/ServicesProblemLed";
import { ServicesHowWeWork } from "@/components/services/ServicesHowWeWork";
import { CrossCuttingCapabilities } from "@/components/services/CrossCuttingCapabilities";
import { ServicesEngineeringProof } from "@/components/services/ServicesEngineeringProof";
import { EngagementModels } from "@/components/services/EngagementModels";
import { ServicesFinalCta } from "@/components/services/ServicesFinalCta";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Services — Product Engineering Services | AROORAA",
  description:
    "AROORAA helps businesses discover, design, engineer, modernize and operate digital products — product strategy, product engineering, AI and automation, application modernization, cloud and platform engineering, and continuous engineering.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <main>
      <ServicesHero />
      <SixServicesGrid />
      <ServicesProblemLed />
      <ServicesHowWeWork />
      <CrossCuttingCapabilities />
      <ServicesEngineeringProof />
      <EngagementModels />
      <ServicesFinalCta />
    </main>
  );
}
