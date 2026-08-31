import { FOUNDATION_LAYERS } from "@/lib/content/work-detail/mindra";
import styles from "./EngineeringFoundationVisual.module.css";

/**
 * Chapter 10, part A — not a literal internal architecture diagram: one
 * clean product surface on top, and a simple stack of six foundation
 * layers beneath it, each named in the public-safe, capability-level
 * language the brief allows (Identity, boundaries, search, APIs, sync,
 * notifications) — never internal service names or data-store detail.
 */
export function EngineeringFoundationVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.surface}>
        <span className={styles.surfaceDot} aria-hidden="true" />
        <span className={styles.surfaceLabel}>The calm Mindra experience</span>
      </div>

      <ol className={styles.layers}>
        {FOUNDATION_LAYERS.map((layer, index) => (
          <li key={layer} className={styles.layer} style={{ opacity: 1 - index * 0.07 }}>
            {layer}
          </li>
        ))}
      </ol>
    </div>
  );
}
