import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { FUTURE_DIRECTION_TITLE } from "@/lib/content/work-detail/mindra";
import { NowFutureSplit } from "./NowFutureSplit";
import styles from "./MindraFutureDirectionTransition.module.css";

/**
 * Chapter 10, part B — an unnumbered continuation of the engineering
 * chapter rather than a new numbered chapter, following the same
 * lightweight Section+Container pattern used for MESA's ecosystem
 * transition: no chapter index badge, just a heading and the Now/Future
 * split beneath it.
 */
export function MindraFutureDirectionTransition() {
  return (
    <Section id="future-direction" spacing="default">
      <Container width="wide">
        <h2 className={`text-h2 ${styles.heading}`}>{FUTURE_DIRECTION_TITLE}</h2>
        <NowFutureSplit />
      </Container>
    </Section>
  );
}
