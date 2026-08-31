import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import styles from "./WorkDetailCta.module.css";

interface RelatedLink {
  label: string;
  href: string;
}

interface WorkDetailCtaProps {
  title: string;
  supporting: string;
  primary: RelatedLink;
  secondary: RelatedLink;
  relatedLinks: RelatedLink[];
}

/**
 * The shared closing section for an Our Work engineering story (W2.1) — a
 * final CTA plus a restrained related-links row (product page, relevant
 * services, Start a Project). Reusable by future /our-work/* detail pages;
 * the specific links are always caller-supplied, never hardcoded here.
 */
export function WorkDetailCta({ title, supporting, primary, secondary, relatedLinks }: WorkDetailCtaProps) {
  return (
    <Section id="cta" tone="dark" spacing="default">
      <Container width="content">
        <SectionHeading title={title} description={supporting} align="center" />
        <div className={styles.actions}>
          <Button href={primary.href} variant="primary">
            {primary.label}
          </Button>
          <Button href={secondary.href} variant="secondary">
            {secondary.label}
          </Button>
        </div>
        <ul className={styles.relatedLinks}>
          {relatedLinks.map((link) => (
            <li key={link.href}>
              <Button href={link.href} variant="ghost">
                {link.label}
              </Button>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
