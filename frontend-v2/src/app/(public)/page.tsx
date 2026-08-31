import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ProductsSnapshot } from "@/components/home/ProductsSnapshot";
import { ProblemsWeSolve } from "@/components/home/ProblemsWeSolve";
import { WhatWeBuild } from "@/components/home/WhatWeBuild";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { HowWeWork } from "@/components/home/HowWeWork";
import { EngineeringProof } from "@/components/home/EngineeringProof";
import { Stories } from "@/components/home/Stories";
import { WhyAroora } from "@/components/home/WhyAroora";
import { AuraIntro } from "@/components/home/AuraIntro";
import { FinalCta } from "@/components/home/FinalCta";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "AROORAA — Product Engineering & Innovation",
  description:
    "AROORAA turns ideas and business problems into production-ready digital products — product engineering, AI and automation, and connected physical products like MESA and Mindra.",
  path: "/",
});

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductsSnapshot />
      <ProblemsWeSolve />
      <WhatWeBuild />
      <FeaturedWork />
      <HowWeWork />
      <EngineeringProof />
      <Stories />
      <WhyAroora />
      <AuraIntro />
      <FinalCta />
    </main>
  );
}
