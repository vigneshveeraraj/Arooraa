import { MIRROR_FIRST_KEY_LINE, MIRROR_STATES } from "@/lib/content/work-detail/smart-mirror";
import styles from "./MirrorStateStudyVisual.module.css";

const STATE_CHIPS: Record<string, string[]> = {
  Quiet: [],
  Glance: ["6:45 AM"],
  "Active Moment": ["6:45 AM", "28°", "Today"],
};

/**
 * Chapter 2 — one substantial, visually dominant mirror (large enough to
 * anchor the whole chapter) shown at its calm "Glance" level, with three
 * small state thumbnails beneath it making the Quiet → Glance → Active
 * Moment progression explicit. The mirror stays the largest object in the
 * composition at every state — reflection first, information second —
 * and the densest thumbnail is still mostly empty glass.
 */
export function MirrorStateStudyVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero} aria-hidden="true">
        <span className={styles.heroSheen} />
        {(STATE_CHIPS.Glance ?? []).map((chip) => (
          <span key={chip} className={styles.heroChip}>
            {chip}
          </span>
        ))}
      </div>

      <div className={styles.states}>
        {MIRROR_STATES.map((state) => (
          <div key={state.name} className={styles.state}>
            <div className={styles.thumb} aria-hidden="true">
              <span className={styles.thumbSheen} />
              {(STATE_CHIPS[state.name] ?? []).map((chip) => (
                <span key={chip} className={styles.thumbChip}>
                  {chip}
                </span>
              ))}
            </div>
            <p className={styles.stateName}>{state.name}</p>
            <p className={styles.stateDescription}>{state.description}</p>
          </div>
        ))}
      </div>

      <p className={styles.keyLine}>{MIRROR_FIRST_KEY_LINE}</p>
    </div>
  );
}
