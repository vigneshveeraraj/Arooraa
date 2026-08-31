import { WHOLE_HOME_CONCEPT_LABEL, WHOLE_HOME_THREADS } from "@/lib/content/work-detail/smart-home";
import styles from "./WholeHomeVisual.module.css";

/**
 * Chapter 13 — the whole-home cross-section concept image, one of the
 * strongest late-page visuals. All eight floating UI overlay panels from
 * the source image (title/tagline, energy, comfort, an undisclosed
 * "Energy Storage" battery panel, rooms-active-count, water level, and an
 * "Everything is working perfectly" status claim) were removed before
 * shipping so the architecture itself carries the story — see
 * image-processing notes. Clearly labeled as a concept visualization, not
 * a completed AROORAA installation.
 */
export function WholeHomeVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{WHOLE_HOME_CONCEPT_LABEL}</span>
        <img
          src="/images/work/smart-home/story/whole-home.webp"
          alt="Whole-home concept visualization: an architectural cross-section showing every room of a home as one coordinated, softly lit environment."
          width={1448}
          height={1086}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <ul className={styles.threads}>
        {WHOLE_HOME_THREADS.map((thread) => (
          <li key={thread} className={styles.thread}>
            {thread}
          </li>
        ))}
      </ul>
    </div>
  );
}
