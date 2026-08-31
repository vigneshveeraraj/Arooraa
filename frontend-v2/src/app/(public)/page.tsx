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
