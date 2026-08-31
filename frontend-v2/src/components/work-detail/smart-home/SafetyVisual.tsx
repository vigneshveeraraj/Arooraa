import { SAFETY_PRINCIPLES } from "@/lib/content/work-detail/smart-home";
import { CheckIcon } from "./SmartHomeIcons";
import styles from "./SafetyVisual.module.css";

/**
 * Chapter 9 — a strong, explicit safety-principles panel: eight rules in
 * a bold grid, each with a small check mark, no giant hazard icon and no
 * dramatic shock imagery. The boundary is stated, not illustrated.
 */
export function SafetyVisual() {
  return (
    <ul className={styles.grid}>
      {SAFETY_PRINCIPLES.map((principle) => (
        <li key={principle} className={styles.principle}>
          <span className={styles.icon} aria-hidden="true">
            <CheckIcon />
          </span>
          <span className={styles.text}>{principle}</span>
        </li>
      ))}
    </ul>
  );
}
