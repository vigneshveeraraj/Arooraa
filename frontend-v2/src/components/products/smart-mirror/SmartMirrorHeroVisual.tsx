import styles from "./SmartMirrorHeroVisual.module.css";

/**
 * Smart Mirror's hero visual (P4.1) — replaces the earlier hand-built
 * glanceable-UI mockup with the real Smart Mirror concept photograph, so the
 * page reads immediately as a physical product rather than another web
 * dashboard. The hero copy already states the same facts (time, weather,
 * reminders) in real text, and the template wraps every heroVisual in an
 * aria-hidden container, so this stays purely illustrative — the caption
 * below is visible to sighted users but intentionally not the only place
 * meaning lives on the page.
 */
export function SmartMirrorHeroVisual() {
  return (
    <figure className={styles.figure}>
      <img
        src="/images/products/smart-mirror/smart-mirror-hero-concept.webp"
        alt="Concept visualization of AROORAA Smart Mirror displaying a morning briefing in a modern home."
        width={1280}
        height={960}
        className={styles.image}
        loading="eager"
      />
      <figcaption className={styles.caption}>Smart Mirror experience concept</figcaption>
    </figure>
  );
}
