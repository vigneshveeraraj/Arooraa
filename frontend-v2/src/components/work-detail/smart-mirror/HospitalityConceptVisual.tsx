import { HOSPITALITY_CONCEPT_ITEMS, HOSPITALITY_CONCEPT_LABEL, HOSPITALITY_FUTURE_DIRECTION } from "@/lib/content/work-detail/smart-mirror";
import styles from "./HospitalityConceptVisual.module.css";

/**
 * Chapter 6 — the premium hospitality concept image, with the source
 * image's fabricated price ("₹1,250") and specific table/party
 * reservation detail ("Table 12 / 2 Guests") removed before shipping (see
 * image-processing notes) — this site never publishes an indicative price,
 * and reservation-looking detail reads too much like a real booking for an
 * illustrative concept. Clearly labeled, with careful wording that never
 * implies guest recognition or a deployed MESA integration.
 */
export function HospitalityConceptVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{HOSPITALITY_CONCEPT_LABEL}</span>
        <img
          src="/images/work/smart-mirror/story/hospitality.webp"
          alt="Concept illustration of a smart mirror in a premium restaurant offering a personalized welcome and menu context beside a guest's reflection."
          width={768}
          height={512}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <ul className={styles.items}>
        {HOSPITALITY_CONCEPT_ITEMS.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>

      <p className={styles.futureNote}>{HOSPITALITY_FUTURE_DIRECTION}</p>
    </div>
  );
}
