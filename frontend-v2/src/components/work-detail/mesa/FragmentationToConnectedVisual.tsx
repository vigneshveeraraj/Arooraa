import { FRAGMENTS } from "@/lib/content/work-detail/mesa";
import styles from "./FragmentationToConnectedVisual.module.css";

const OFFSETS = [-14, 10, -6, 16];
const ROTATIONS = [-4, 3, -3, 4];

const SCATTERED = FRAGMENTS.map((fragment, index) => ({
  fragment,
  offset: OFFSETS[index] ?? 0,
  rotation: ROTATIONS[index] ?? 0,
}));

/**
 * Chapter 2's before/after composition — the same four restaurant moments
 * first sit as disconnected islands (broken vertical alignment, slight
 * rotation, real gaps between them), then reassemble as one tight,
 * connected row anchored around a small table accent. A product-thinking
 * visual, not a "competitor bad / MESA good" comparison — both rows show
 * MESA's own four moments, just before and after being designed around one
 * shared table.
 */
export function FragmentationToConnectedVisual() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.stateLabel}>Fragmented</p>
      <div className={styles.scatteredRow}>
        {SCATTERED.map((item) => (
          <div
            key={item.fragment}
            className={styles.island}
            style={{ transform: `translateY(${item.offset}px) rotate(${item.rotation}deg)` }}
          >
            {item.fragment}
          </div>
        ))}
      </div>

      <div className={styles.divider} aria-hidden="true">
        ↓
      </div>

      <p className={styles.stateLabel}>Connected around the table</p>
      <div className={styles.connectedRow}>
        <span className={styles.tableAccent} aria-hidden="true" />
        {FRAGMENTS.map((fragment) => (
          <div key={fragment} className={styles.piece}>
            {fragment}
          </div>
        ))}
      </div>
    </div>
  );
}
