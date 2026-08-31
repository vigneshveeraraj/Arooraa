import { SmartHomePanel } from "./SmartHomePanel";
import styles from "./SmartHomeHeroVisual.module.css";

const NODES = [
  { label: "Energy", tone: "accent" as const },
  { label: "Control", tone: "accent" as const },
  { label: "Water", tone: "water" as const },
  { label: "Safety", tone: "warning" as const },
  { label: "Security", tone: "warning" as const },
  { label: "Manual Switch", tone: "success" as const },
];

/**
 * Smart Home's hero visual (P5) — an original, non-photographic conceptual
 * illustration distinct from MESA/Mindra/Smart Mirror's visual language: a
 * simple house outline with the home's systems (energy, control, water,
 * safety, security, manual switch) shown as calm labeled nodes connected
 * into one local home layer. No real wiring, no electrical schematic, no
 * fake production dashboard. The hero copy already states the same facts in
 * real text, so this stays purely illustrative (aria-hidden, per the
 * template's existing hero-visual wrapper).
 */
export function SmartHomeHeroVisual() {
  return (
    <SmartHomePanel className={styles.panel}>
      <svg className={styles.house} viewBox="0 0 64 40" aria-hidden="true">
        <path
          d="M4 38 V18 L32 2 L60 18 V38 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M24 38 V24 H40 V38" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>

      <p className={styles.layerLabel}>Local Home Layer</p>

      <div className={styles.nodes}>
        {NODES.map((node) => (
          <span key={node.label} className={styles.node}>
            <span className={`${styles.dot} ${styles[node.tone]}`} />
            {node.label}
          </span>
        ))}
      </div>
    </SmartHomePanel>
  );
}
