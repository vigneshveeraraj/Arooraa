import { ENGINEERING_CONSIDERATIONS, ENGINEERING_LAYERS } from "@/lib/content/work-detail/smart-mirror";
import styles from "./EngineeringCrossSectionVisual.module.css";

/**
 * Chapter 13 — a clean product cross-section: the finished mirror surface
 * on top, the four conceptual layers (Experience, Display, Edge, Physical
 * Product) stacked beneath it with graduated depth, followed by the public
 * engineering considerations as real text. No implementation internals.
 */
export function EngineeringCrossSectionVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.finished} aria-hidden="true">
        <span className={styles.sheen} />
      </div>

      <div className={styles.stack}>
        {ENGINEERING_LAYERS.map((layer, index) => (
          <div key={layer.name} className={styles.layer} style={{ opacity: 1 - index * 0.16 }}>
            <p className={styles.layerName}>{layer.name}</p>
            <p className={styles.layerDescription}>{layer.description}</p>
          </div>
        ))}
      </div>

      <ul className={styles.considerations}>
        {ENGINEERING_CONSIDERATIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
