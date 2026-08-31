import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SERVICE_GROUPS, SERVICES_HEADING } from "@/lib/content/services";
import styles from "./WhatWeBuild.module.css";

export function WhatWeBuild() {
  return (
    <Section spacing="compact" className={styles.whatWeBuild}>
      <Container>
        <SectionHeading eyebrow={SERVICES_HEADING.eyebrow} title={SERVICES_HEADING.title} />

        <div className={styles.grid}>
          {SERVICE_GROUPS.map((service) => (
            <div key={service.id} className={styles.item}>
              <div className={styles.itemContent}>
                <p className="text-h4">{service.name}</p>
                <p className={`text-body-sm ${styles.description}`}>{service.description}</p>
                <Link href={service.href} className={styles.link}>
                  {`Explore ${service.name}`}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
