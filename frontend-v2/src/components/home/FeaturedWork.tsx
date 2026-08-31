import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FEATURED_WORK_HEADING, MESA_FEATURE, SUPPORTING_WORK } from "@/lib/content/work";
import styles from "./FeaturedWork.module.css";

export function FeaturedWork() {
  return (
    <Section spacing="default">
      <Container>
        <SectionHeading
          eyebrow={FEATURED_WORK_HEADING.eyebrow}
          title={FEATURED_WORK_HEADING.title}
          description={FEATURED_WORK_HEADING.description}
        />

        <Card className={styles.mesaFeature}>
          <Badge variant="accent">Flagship product</Badge>
          <h3 className={`text-h2 ${styles.mesaName}`}>{MESA_FEATURE.name}</h3>
          <p className={`text-label ${styles.positioning}`}>{MESA_FEATURE.positioning}</p>
          <p className={`text-body ${styles.problemStatement}`}>{MESA_FEATURE.problemStatement}</p>

          <div className={styles.badgeRow}>
            {MESA_FEATURE.systemAreas.map((area) => (
              <Badge key={area} variant="accent">
                {area}
              </Badge>
            ))}
          </div>

          <ol className={styles.flow} aria-label={`How ${MESA_FEATURE.name} flows`}>
            {MESA_FEATURE.flowSteps.map((step, index) => (
              <li key={step} className={styles.flowStep}>
                <span className={styles.flowLabel}>{step}</span>
                {index < MESA_FEATURE.flowSteps.length - 1 ? (
                  <span className={styles.flowArrow} aria-hidden="true">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>

          <div className={styles.engineering}>
            <p className={`text-label ${styles.engineeringHeading}`}>{MESA_FEATURE.engineeringHeading}</p>
            <div className={styles.badgeRow}>
              {MESA_FEATURE.engineeringProof.map((item) => (
                <Badge key={item} variant="neutral">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <Link href={MESA_FEATURE.cta.href} className={styles.mesaCta}>
            {MESA_FEATURE.cta.label}
            <span aria-hidden="true"> →</span>
          </Link>
        </Card>

        <div className={styles.supportingGrid}>
          {SUPPORTING_WORK.map((item) => (
            <Card key={item.id} interactive className={styles.supportingCard}>
              <h3 className="text-h3">{item.name}</h3>
              <p className={`text-body-sm ${styles.challenge}`}>{item.challenge}</p>
              <div className={styles.badgeRow}>
                {item.proofPoints.map((point) => (
                  <Badge key={point} variant="neutral">
                    {point}
                  </Badge>
                ))}
              </div>
              <Link href={item.href} className={styles.exploreLink}>
                {`Explore ${item.name}`}
                <span aria-hidden="true"> →</span>
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
