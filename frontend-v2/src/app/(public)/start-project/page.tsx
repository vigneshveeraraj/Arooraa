import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { StartProjectHero } from "@/components/start-project/StartProjectHero";
import { WhatHappensNext } from "@/components/start-project/WhatHappensNext";
import { StartWithSection } from "@/components/start-project/StartWithSection";
import { StartProjectForm } from "@/components/start-project/StartProjectForm";
import { OwnProductProofSection } from "@/components/start-project/OwnProductProofSection";

export const metadata: Metadata = {
  title: "Start a Project | AROORAA",
  description:
    "Tell AROORAA what should work better — a new product or MVP, an existing product to improve, an AI/data or automation opportunity, application modernization, cloud/platform engineering, or a connected product. No complete specification required.",
  // A lead-capture form isn't useful search-engine content on its own; kept
  // followable so link equity still flows to it, just not indexed as a
  // landing page (matches the equivalent page's established convention).
  robots: { index: false, follow: true },
};

export default function StartProjectPage() {
  return (
    <main>
      <StartProjectHero />
      <WhatHappensNext />
      <StartWithSection />
      <Section id="form" spacing="default">
        <Container width="wide">
          <StartProjectForm />
        </Container>
      </Section>
      <OwnProductProofSection />
    </main>
  );
}
