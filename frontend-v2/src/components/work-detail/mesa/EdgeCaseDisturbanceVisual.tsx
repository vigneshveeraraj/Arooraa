import { EDGE_CASES } from "@/lib/content/work-detail/mesa";
import styles from "./EdgeCaseDisturbanceVisual.module.css";

const POSITIONS = [60, 160, 260, 360, 460, 560, 660, 760];
const OFFSETS = [-30, 30, -24, 26, -28, 32, -22, 28];

/**
 * Chapter 8 — one steady main journey line with eight small disturbance
 * points pulled off it (above/below, alternating), each a short stub and a
 * dot rather than a full branching path — the line itself stays legible
 * and continuous despite them, which is the whole point. The eight
 * scenarios are listed as real text below, generic and public-safe.
 */
export function EdgeCaseDisturbanceVisual() {
  return (
    <div className={styles.wrapper}>
      <svg className={styles.svg} viewBox="0 0 800 140" preserveAspectRatio="none" aria-hidden="true">
        <line className={styles.mainLine} x1="20" y1="70" x2="780" y2="70" />
        {POSITIONS.map((x, index) => {
          const offset = OFFSETS[index] ?? 0;
          const y = 70 + offset;
          return (
            <g key={x}>
              <line className={styles.stub} x1={x} y1="70" x2={x} y2={y} />
              <circle className={styles.disturbance} cx={x} cy={y} r="5" />
            </g>
          );
        })}
      </svg>
      <ul className={styles.list}>
        {EDGE_CASES.map((edgeCase) => (
          <li key={edgeCase} className={styles.item}>
            {edgeCase}
          </li>
        ))}
      </ul>
    </div>
  );
}
