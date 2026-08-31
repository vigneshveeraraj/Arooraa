import { CAPABILITY_CLUSTERS } from "@/lib/content/work-detail/mesa";
import styles from "./CapabilityLandscapeVisual.module.css";

const POSITIONS = [
  { x: 50, y: 52, size: "hub" as const },
  { x: 22, y: 26, size: "md" as const },
  { x: 78, y: 26, size: "md" as const },
  { x: 20, y: 80, size: "sm" as const },
  { x: 80, y: 80, size: "sm" as const },
  { x: 50, y: 8, size: "future" as const },
];

/**
 * Chapter 10 (rebuilt W2.1.1) — a connected restaurant ecosystem landscape
 * instead of six equal cards: Dine-In sits as the largest hub at the
 * center (the guest-facing core), Restaurant Operations and Kitchen sit
 * closer and larger than Billing/POS and Management, and Intelligence
 * sits apart at the horizon, dashed-bordered and explicitly tagged Future
 * Direction. Short, faint proximity lines (not a wiring diagram) connect
 * every cluster back to the hub. Below 640px the spatial layout gives way
 * to a plain stacked list rather than cramming percentage-positioned text
 * into a shrinking canvas.
 */
export function CapabilityLandscapeVisual() {
  const hub = POSITIONS[0]!;
  return (
    <div className={styles.landscape}>
      <svg className={styles.connectors} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {POSITIONS.slice(1).map((pos, index) => (
          <line key={index} className={styles.connector} x1={hub.x} y1={hub.y} x2={pos.x} y2={pos.y} />
        ))}
      </svg>
      {CAPABILITY_CLUSTERS.map((cluster, index) => {
        const pos = POSITIONS[index] ?? hub;
        return (
          <div
            key={cluster.name}
            className={`${styles.cluster} ${styles[pos.size]} ${cluster.future ? styles.future : ""}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <p className={styles.name}>{cluster.name}</p>
            <p className={styles.description}>{cluster.description}</p>
            {cluster.future ? <span className={styles.futureTag}>Future Direction</span> : null}
          </div>
        );
      })}
    </div>
  );
}
