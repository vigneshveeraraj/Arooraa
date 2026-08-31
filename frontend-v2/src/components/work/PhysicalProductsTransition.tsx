import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { PHYSICAL_TRANSITION } from "@/lib/content/our-work";
import styles from "./PhysicalProductsTransition.module.css";

/**
 * The bridge between the pure-software stories (MESA, Mindra) and the
 * physical/edge stories (Smart Mirror, Smart Home) — a full-width dark
 * editorial band (W1 brief §13), deliberately mostly whitespace and
 * typography rather than another illustrated scene, with one small
 * decorative divider (a screen shape resolving into a simple object) to
 * hint at the shift without turning into its own diagram.
 */
export function PhysicalProductsTransition() {
  return (
    <Section id="physical-transition" tone="dark" spacing="default">
      <Container width="content">
        <div className={styles.block}>
          <svg className={styles.divider} viewBox="0 0 160 40" aria-hidden="true">
            <rect className={styles.screen} x="10" y="8" width="40" height="24" rx="3" />
            <line className={styles.dividerLine} x1="60" y1="20" x2="100" y2="20" />
            <rect className={styles.cube} x="110" y="8" width="24" height="24" rx="3" transform="rotate(20 122 20)" />
          </svg>
          <h2 className={`text-h2 ${styles.title}`}>{PHYSICAL_TRANSITION.title}</h2>
          <p className={`text-body-lg ${styles.body}`}>{PHYSICAL_TRANSITION.body}</p>
        </div>
      </Container>
    </Section>
  );
}
