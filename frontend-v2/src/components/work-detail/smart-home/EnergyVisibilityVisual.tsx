import { ENERGY_CONCEPT_LABEL, ENERGY_VISIBILITY_ITEMS } from "@/lib/content/work-detail/smart-home";
import styles from "./EnergyVisibilityVisual.module.css";

/**
 * Chapter 4 — the energy-visibility bedroom concept image, clearly labeled
 * as an experience concept. The room/device-level figures are the
 * deliberate subject of this chapter and are kept as illustrative concept
 * data, not removed — audited clean of names, dates, costs and any
 * non-illustrative claims.
 */
export function EnergyVisibilityVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{ENERGY_CONCEPT_LABEL}</span>
        <img
          src="/images/work/smart-home/story/energy-visibility.webp"
          alt="Concept illustration of a bedroom showing illustrative room- and device-level energy usage information."
          width={1448}
          height={1086}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <ul className={styles.items}>
        {ENERGY_VISIBILITY_ITEMS.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
