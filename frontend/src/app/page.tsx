import { Hero } from "@/components/home/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { Services } from "@/components/home/Services";
import { HowWeWork } from "@/components/home/HowWeWork";
import { FeaturedProduct } from "@/components/home/FeaturedProduct";
import { StatsBar } from "@/components/home/StatsBar";
import { MesaIntro } from "@/components/home/MesaIntro";
import { JourneyFlow } from "@/components/home/JourneyFlow";
import { PlatformModules } from "@/components/home/PlatformModules";
import { DemoCenter } from "@/components/home/DemoCenter";
import { SmartMirrorTeaser } from "@/components/home/SmartMirrorTeaser";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { OurWork } from "@/components/home/OurWork";
import { WhyAroora } from "@/components/home/WhyAroora";
import { FinalCta } from "@/components/home/FinalCta";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhatWeDo />
      <Services />
      <HowWeWork />
      <FeaturedProduct />
      <StatsBar />
      <MesaIntro />
      <JourneyFlow />
      <PlatformModules />
      <DemoCenter />
      <SmartMirrorTeaser />
      <BlogTeaser />
      <OurWork />
      <WhyAroora />
      <FinalCta />
    </main>
  );
}
