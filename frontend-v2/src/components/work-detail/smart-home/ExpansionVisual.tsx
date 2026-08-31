import { EXPANSION_PROOF_POINTS, EXPANSION_STAGES } from "@/lib/content/work-detail/smart-home";
import styles from "./ExpansionVisual.module.css";

const GROWTH_STAGES = [
  { name: "One Room", filled: 1 },
  { name: "Several Rooms", filled: 3 },
  { name: "Coordinated Home", filled: 5 },
];

/**
 * Chapter 5 — a clean staged-growth progression: three panels, each a
 * 5-cell room grid with an increasing number of filled (active) rooms,
 * naming the five real rooms the product actually stages through, plus
 * the proof points required before expanding — no fake timeline or date.
 */
export function ExpansionVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stages}>
        {GROWTH_STAGES.map((stage) => (
          <div key={stage.name} className={styles.stage}>
            <div className={styles.grid} aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className={`${styles.cell} ${index < stage.filled ? styles.cellFilled : ""}`} />
              ))}
            </div>
            <p className={styles.stageName}>{stage.name}</p>
          </div>
        ))}
      </div>

      <ul className={styles.rooms}>
        {EXPANSION_STAGES.map((room) => (
          <li key={room} className={styles.room}>
            {room}
          </li>
        ))}
      </ul>

      <div className={styles.proof}>
        <p className={styles.proofLabel}>Proven before expanding</p>
        <ul className={styles.proofList}>
          {EXPANSION_PROOF_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
