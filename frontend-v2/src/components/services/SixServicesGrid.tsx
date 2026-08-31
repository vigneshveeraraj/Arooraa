import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SERVICE_GROUPS, SERVICES_HEADING } from "@/lib/content/services";
import styles from "./SixServicesGrid.module.css";

/**
 * The six frozen service groups (S1) — an editorial numbered list rather
 * than six identical generic cards, per the brief's explicit preference.
 * Reuses SERVICE_GROUPS/SERVICES_HEADING as-is (the homepage's WhatWeBuild
 * section already reads this same data); this component gives it a
 * different, more detailed presentation appropriate to the Services Index.
 */
export function SixServicesGrid() {
  return (
    <Section id="services" spacing="compact">
      <Container>
        <SectionHeading eyebrow={SERVICES_HEADING.eyebrow} title={SERVICES_HEADING.title} />

        <ol className={styles.list}>
          {SERVICE_GROUPS.map((service, index) => (
            <li key={service.id} className={styles.item}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.itemContent}>
                <p className="text-h3">{service.name}</p>
                <p className={`text-body-sm ${styles.description}`}>{service.description}</p>
                <Link href={service.href} className={styles.link}>
                  {`Explore ${service.name}`}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
