import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { MesaIntro } from "@/components/home/MesaIntro";
import { JourneyFlow } from "@/components/home/JourneyFlow";
import { PlatformModules } from "@/components/home/PlatformModules";
import { DemoCenter } from "@/components/home/DemoCenter";
import { BeyondMesa } from "@/components/home/BeyondMesa";
import { SmartMirrorTeaser } from "@/components/home/SmartMirrorTeaser";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { FinalCta } from "@/components/home/FinalCta";

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <MesaIntro />
      <JourneyFlow />
      <PlatformModules />
      <DemoCenter />
      <BeyondMesa />
      <SmartMirrorTeaser />
      <BlogTeaser />
      <FinalCta />
    </main>
  );
}
