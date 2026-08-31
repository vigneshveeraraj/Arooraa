import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutPhilosophyBand } from "@/components/about/AboutPhilosophyBand";
import { WhyAroorraSection } from "@/components/about/WhyAroorraSection";
import { ProductsFirstSection } from "@/components/about/ProductsFirstSection";
import { SameDisciplineSection } from "@/components/about/SameDisciplineSection";
import { IdeaToProductionSection } from "@/components/about/IdeaToProductionSection";
import { CustomerProviderBridgeSection } from "@/components/about/CustomerProviderBridgeSection";
import { ProductAndEngineeringSection } from "@/components/about/ProductAndEngineeringSection";
import { AiCapabilitySection } from "@/components/about/AiCapabilitySection";
import { EngineeringPrinciplesSection } from "@/components/about/EngineeringPrinciplesSection";
import { BuildingHonestlySection } from "@/components/about/BuildingHonestlySection";
import { FounderLedSection } from "@/components/about/FounderLedSection";
import { FutureDirectionSection } from "@/components/about/FutureDirectionSection";
import { AboutClosingStory } from "@/components/about/AboutClosingStory";

export const metadata: Metadata = {
  title: "About AROORAA — Product Engineering & Innovation | AROORAA",
  description:
    "Why AROORAA exists — a product-engineering company turning repeated real-world friction, and the gap between customer and provider experience, into thoughtfully engineered digital products. Founder-led and product-led, building MESA, Mindra, Smart Mirror and Arooraa Smart Home.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutPhilosophyBand />
      <WhyAroorraSection />
      <ProductsFirstSection />
      <SameDisciplineSection />
      <IdeaToProductionSection />
      <CustomerProviderBridgeSection />
      <ProductAndEngineeringSection />
      <AiCapabilitySection />
      <EngineeringPrinciplesSection />
      <BuildingHonestlySection />
      <FounderLedSection />
      <FutureDirectionSection />
      <AboutClosingStory />
    </main>
  );
}
