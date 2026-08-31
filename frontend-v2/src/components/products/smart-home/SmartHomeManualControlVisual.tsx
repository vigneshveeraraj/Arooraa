import styles from "./SmartHomeManualControlVisual.module.css";

const PRINCIPLES = ["Physical switch remains usable.", "Local control remains available.", "Mobile control adds convenience."];

/**
 * The Experience section's visual (P5.1) — replaces the earlier abstract
 * three-node illustration with the real mobile-app concept photograph,
 * rendered at flagship scale via stackedVisualSections. Composed as its own
 * two-column arrangement (principles beside the phone on desktop, stacked
 * on mobile) so the phone reads as a meaningfully sized product visual
 * rather than a small image floating in a large empty column, while the
 * phone image itself stays capped to a sensible device-sized width instead
 * of stretching to the section's full flagship column.
 */
export function SmartHomeManualControlVisual() {
  return (
    <div className={styles.row}>
      <div className={styles.textColumn}>
        <p className={styles.caption}>Smart when connected. Usable even when it isn&apos;t.</p>
        <ul className={styles.principles}>
          {PRINCIPLES.map((principle) => (
            <li key={principle} className={styles.principle}>
              {principle}
            </li>
          ))}
        </ul>
      </div>

      <figure className={styles.figure}>
        <img
          src="/images/products/smart-home/smart-home-mobile-control-concept.webp"
          alt="Concept visualization of the Arooraa Smart Home mobile experience showing room controls, AC status, energy usage, lights and water-tank information."
          width={900}
          height={1125}
          className={styles.image}
          loading="lazy"
        />
        <figcaption className={styles.imageCaption}>Concept visualization</figcaption>
      </figure>
    </div>
  );
}
