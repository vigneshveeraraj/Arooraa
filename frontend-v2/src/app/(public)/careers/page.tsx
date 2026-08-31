import type { Metadata } from "next";
import { CareersHero } from "@/components/careers/CareersHero";
import { CareersInPageNav } from "@/components/careers/CareersInPageNav";
import { CurrentOpeningsSection } from "@/components/careers/CurrentOpeningsSection";
import { CareerFamiliesSection } from "@/components/careers/CareerFamiliesSection";
import { PlannedRolesSection } from "@/components/careers/PlannedRolesSection";
import { WhyBuildHereSection } from "@/components/careers/WhyBuildHereSection";
import { ProductsExposureSection } from "@/components/careers/ProductsExposureSection";
import { WorkingPrinciplesSection } from "@/components/careers/WorkingPrinciplesSection";
import { HiringProcessSection } from "@/components/careers/HiringProcessSection";
import { CandidateResourcesSection } from "@/components/careers/CandidateResourcesSection";
import { EarlyCareersSection } from "@/components/careers/EarlyCareersSection";
import { TalentCommunitySection } from "@/components/careers/TalentCommunitySection";
import { TrustNoticesSection } from "@/components/careers/TrustNoticesSection";
import { CareersFaqSection } from "@/components/careers/CareersFaqSection";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Careers at AROORAA | Product Engineering & Innovation",
  description:
    "Build what should exist next. Explore career paths in AI engineering, Java and React engineering, product design, sales and marketing at AROORAA — a product-engineering company in Chennai, India.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <main>
      <CareersHero />
      <CareersInPageNav />
      <CurrentOpeningsSection />
      <CareerFamiliesSection />
      <PlannedRolesSection />
      <WhyBuildHereSection />
      <ProductsExposureSection />
      <WorkingPrinciplesSection />
      <HiringProcessSection />
      <CandidateResourcesSection />
      <EarlyCareersSection />
      <TalentCommunitySection />
      <TrustNoticesSection />
      <CareersFaqSection />
    </main>
  );
}
