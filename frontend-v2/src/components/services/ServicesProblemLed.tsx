import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SERVICES_INDEX_PROBLEMS, SERVICES_INDEX_PROBLEMS_HEADING, getServiceGroup } from "@/lib/content/services";
import styles from "./ServicesProblemLed.module.css";

/**
 * "What are you trying to solve?" (S1) — real business scenarios, phrased
 * the way a customer would say them, each routing to the service group(s)
 * that address it. Separate from the homepage's own ProblemsWeSolve (which
 * reads PROBLEM_STATEMENTS, not SERVICES_INDEX_PROBLEMS) so the frozen
 * homepage section stays untouched.
 */
export function ServicesProblemLed() {
  return (
    <Section id="start-with-the-problem" spacing="compact" tone="dark">
      <Container>
        <SectionHeading eyebrow={SERVICES_INDEX_PROBLEMS_HEADING.eyebrow} title={SERVICES_INDEX_PROBLEMS_HEADING.title} />

        <ol className={styles.list}>
          {SERVICES_INDEX_PROBLEMS.map((scenario) => (
            <li key={scenario.id} className={styles.item}>
              <span className={styles.number} aria-hidden="true">
                {scenario.number}
              </span>
              <div className={styles.itemContent}>
                <p className={`text-h4 ${styles.problem}`}>{scenario.problem}</p>
                <div className={styles.services}>
                  {scenario.serviceIds.map((serviceId) => {
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
