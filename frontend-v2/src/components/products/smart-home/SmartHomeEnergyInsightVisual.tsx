import styles from "./SmartHomeEnergyInsightVisual.module.css";

/**
 * The Energy section's visual (P5.1) — replaces the earlier fabricated
 * bento dashboard with the real room-energy concept photograph (Ground
 * Floor Bedroom: total usage, daily trend, device breakdown, local-control
 * status), rendered at flagship scale via stackedVisualSections. All
 * numbers in the image are illustrative example data, not a real
 * household's reading or a claimed savings figure — the section's own body
 * text already states the actual claim, so this stays purely illustrative.
 */
export function SmartHomeEnergyInsightVisual() {
  return (
    <figure className={styles.figure}>
      <img
        src="/images/products/smart-home/smart-home-room-energy-concept.webp"
        alt="Concept visualization of Ground Floor Bedroom monthly energy usage with device-level breakdown and local-control status."
        width={1400}
        height={1050}
        className={styles.image}
        loading="lazy"
      />
      <figcaption className={styles.caption}>Illustrative Smart Home energy experience</figcaption>
    </figure>
  );
}
