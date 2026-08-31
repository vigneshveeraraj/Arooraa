import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROBLEM_STATEMENTS, PROBLEMS_HEADING, getServiceGroup } from "@/lib/content/services";
import styles from "./ProblemsWeSolve.module.css";

export function ProblemsWeSolve() {
  return (
    <Section spacing="compact" className={styles.problems}>
      <Container>
        <SectionHeading eyebrow={PROBLEMS_HEADING.eyebrow} title={PROBLEMS_HEADING.title} />

        <ol className={styles.list}>
          {PROBLEM_STATEMENTS.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.number} aria-hidden="true">
                {item.number}
              </span>
              <div className={styles.itemContent}>
                <p className={`text-h3 ${styles.problem}`}>{item.problem}</p>
                <p className={`text-body-sm ${styles.explanation}`}>{item.explanation}</p>
                <div className={styles.services}>
                  {item.serviceIds.map((serviceId) => {
                    const service = getServiceGroup(serviceId);
                    return (
                      <Link key={serviceId} href={service.href} className={styles.serviceLink}>
                        {service.name}
                        <span aria-hidden="true"> →</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
