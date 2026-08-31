import { SALON_CONCEPT_ITEMS, SALON_CONCEPT_LABEL, SALON_FUTURE_DIRECTION } from "@/lib/content/work-detail/smart-mirror";
import styles from "./SalonConceptVisual.module.css";

/**
 * Chapter 5 — the salon/haircut-preview concept image, audited clean (no
 * fabricated names, prices or reservation data), clearly labeled as an
 * experience concept. Followed by the real concept item list and careful
 * wording that keeps the stylist and the customer in control of the
 * decision.
 */
export function SalonConceptVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{SALON_CONCEPT_LABEL}</span>
        <img
          src="/images/work/smart-mirror/story/salon-preview.webp"
          alt="Concept illustration of a smart mirror in a modern salon showing multiple illustrative haircut-preview directions beside a person's reflection."
          width={768}
          height={512}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <ul className={styles.items}>
        {SALON_CONCEPT_ITEMS.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>

      <p className={styles.futureNote}>{SALON_FUTURE_DIRECTION}</p>
    </div>
  );
}
