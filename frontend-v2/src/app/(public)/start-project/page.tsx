import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { StartProjectHero } from "@/components/start-project/StartProjectHero";
import { WhatHappensNext } from "@/components/start-project/WhatHappensNext";
import { StartWithSection } from "@/components/start-project/StartWithSection";
import { StartProjectForm } from "@/components/start-project/StartProjectForm";
import { OwnProductProofSection } from "@/components/start-project/OwnProductProofSection";
import { pageMetadata } from "@/lib/seo/metadata";

// W4.1 Phase 16: indexable — this is a legitimate public commercial landing
// page, not a session-specific or post-submission state (the one after
// actually submitting the form is never a distinct crawlable route).
export const metadata: Metadata = pageMetadata({
  title: "Start a Project | AROORAA",
  description:
    "Tell AROORAA what should work better — a new product or MVP, an existing product to improve, an AI/data or automation opportunity, application modernization, cloud/platform engineering, or a connected product. No complete specification required.",
  path: "/start-project",
});

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
