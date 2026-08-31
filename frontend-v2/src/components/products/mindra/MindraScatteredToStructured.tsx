import styles from "./MindraScatteredToStructured.module.css";

const SCATTERED_PLACES = ["A Note", "A Chat", "Your Memory", "A Piece of Paper", "A Calendar"];
const STRUCTURED_ITEMS = ["Notes", "Groceries", "Tasks", "Meals", "Reminders"];

/**
 * Original Mindra-specific picture story for "The Problem" (P3, Visual A).
 * The same everyday things named in the section's own copy — a note, a
 * chat, memory, paper, a calendar — shown scattered and tilted, then the
 * same five kinds of information shown gathered into one calm Mindra list.
 * No internal data model or information architecture: these are everyday
 * concepts, not system components. Every label is real, accessible text;
 * only the connecting arrow and card chrome are decorative.
 */
export function MindraScatteredToStructured() {
  return (
    <div className={styles.story}>
      <div className={styles.group}>
        <p className={`text-eyebrow ${styles.groupLabel}`}>Scattered</p>
        <ul className={styles.scatter} data-testid="scattered-panel">
          {SCATTERED_PLACES.map((place, index) => (
            <li key={place} className={styles.chip} data-tilt={index % 2 === 0 ? "left" : "right"}>
              {place}
            </li>
          ))}
        </ul>
      </div>

      <span className={styles.arrow} aria-hidden="true">
        ↓
      </span>

      <div className={styles.group}>
        <p className={`text-eyebrow ${styles.groupLabel}`}>One calm place</p>
        <div className={styles.card} data-testid="structured-panel">
          {STRUCTURED_ITEMS.map((item) => (
            <div key={item} className={styles.cardRow}>
              <span className={styles.cardDot} aria-hidden="true" />
              <span className={styles.cardLabel}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
