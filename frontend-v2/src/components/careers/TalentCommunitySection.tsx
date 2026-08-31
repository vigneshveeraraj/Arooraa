import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TALENT_COMMUNITY_CONTENT } from "@/lib/content/careers";
import { TalentAlertForm } from "./talent-community/TalentAlertForm";

export function TalentCommunitySection() {
  return (
    <Section id="talent-community">
      <Container width="content">
        <SectionHeading
          eyebrow={TALENT_COMMUNITY_CONTENT.eyebrow}
          title={TALENT_COMMUNITY_CONTENT.title}
          description={TALENT_COMMUNITY_CONTENT.description}
        />
        <TalentAlertForm />
      </Container>
    </Section>
  );
}
