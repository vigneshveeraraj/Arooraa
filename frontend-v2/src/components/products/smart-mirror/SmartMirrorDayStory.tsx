import styles from "./SmartMirrorDayStory.module.css";

const STEPS = ["Glance", "Ask", "Act", "Return to your reflection"];
const EVENING_ITEMS = ["Tomorrow's first appointment", "Home energy summary", "Good Night routine"];

/**
 * The morning + evening picture story (P4.2) — Morning is now the section's
 * primary, large-scale visual moment (rendered full-width via the template's
 * `stackedVisualSections`), with the glance/ask/act/return rhythm grouped
 * directly beneath it so the two read as one composition. Evening stays a
 * small, clearly secondary text panel below — no second photograph, so the
 * hierarchy stays unambiguous rather than presenting two equally-weighted
 * moments.
 */
export function SmartMirrorDayStory() {
  return (
    <div className={styles.story}>
      <figure className={styles.morningFigure}>
        <img
          src="/images/products/smart-mirror/smart-mirror-morning-concept.webp"
          alt="Concept visualization of AROORAA Smart Mirror in a bedroom in the morning, showing the time, weather, a first meeting and a family reminder."
          width={1120}
          height={840}
          className={styles.morningImage}
          loading="lazy"
        />
        <figcaption className={`text-eyebrow ${styles.sceneLabel}`}>Morning — concept experience</figcaption>
      </figure>

      <ol className={styles.rhythm} aria-label="A glance, ask, act, return rhythm">
        {STEPS.map((step) => (
          <li key={step} className={styles.step}>
            {step}
          </li>
        ))}
      </ol>

      <div className={styles.eveningScene}>
        <p className={`text-eyebrow ${styles.sceneLabel}`}>Evening — planned direction</p>
        <ul className={styles.eveningList}>
          {EVENING_ITEMS.map((item) => (
            <li key={item} className={styles.eveningItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
