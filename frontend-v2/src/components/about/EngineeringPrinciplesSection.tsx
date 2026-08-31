import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ENGINEERING_PRINCIPLES_HEADING } from "@/lib/content/about";
import { EngineeringPrinciplesVisual } from "./EngineeringPrinciplesVisual";

/** Chapter 08 — Engineering principles (W3.1 §14). */
export function EngineeringPrinciplesSection() {
  return (
    <Section id="principles" spacing="default">
      <Container width="wide">
        <SectionHeading title={ENGINEERING_PRINCIPLES_HEADING} />
        <EngineeringPrinciplesVisual />
      </Container>
    </Section>
  );
}
