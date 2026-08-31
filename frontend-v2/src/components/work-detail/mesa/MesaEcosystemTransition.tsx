import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MESA_ECOSYSTEM_TRANSITION } from "@/lib/content/work-detail/mesa";
import styles from "./MesaEcosystemTransition.module.css";

/**
 * W2.1.2D — a short, unnumbered bridge between Chapter 4 (four roles) and
 * Chapter 5 (product decisions): the whole-ecosystem summary showing how
 * MESA connects those roles and experiences. Follows the same lightweight,
 * mostly-whitespace pattern as the index page's PhysicalProductsTransition
 * rather than the numbered WorkDetailChapter frame, since this isn't one
 * of the fifteen chapters — just a native editorial visual sitting in the
 * page's own background, no card, no extra shadow, so the illustration
 * reads as part of the page rather than a pasted picture.
 */
export function MesaEcosystemTransition() {
  return (
    <Section id="mesa-ecosystem" spacing="default">
      <Container width="wide">
        <div className={styles.head}>
          <Eyebrow>{MESA_ECOSYSTEM_TRANSITION.eyebrow}</Eyebrow>
          <h2 className={`text-h2 ${styles.heading}`}>{MESA_ECOSYSTEM_TRANSITION.heading}</h2>
          <p className={`text-body-lg ${styles.supporting}`}>{MESA_ECOSYSTEM_TRANSITION.supporting}</p>
        </div>
        <figure className={styles.figure}>
          <img
            src="/images/work/mesa/story/ecosystem.webp"
            alt="MESA connected restaurant ecosystem showing guest dining, digital dining, menu and ordering, service team, kitchen coordination, billing, restaurant management, and business view."
            width={1500}
            height={844}
            className={styles.image}
            loading="lazy"
          />
        </figure>
      </Container>
    </Section>
  );
}
