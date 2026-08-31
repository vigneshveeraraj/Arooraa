import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { CUSTOMER_PROVIDER_BRIDGE } from "@/lib/content/about";
import styles from "./CustomerProviderBridgeVisual.module.css";

const SIGNAL_Y = [80, 140, 200, 260, 320];

/**
 * Chapter 05's signature visual (W3.1 §11) — not a literal bridge, but a
 * translating signal layer between a customer figure and a provider
 * figure: requests/context/action flow one way, response/feedback flow
 * back. Signal labels are real HTML text positioned over a decorative SVG
 * scene (the same hybrid pattern used across the site's other visuals).
 */
export function CustomerProviderBridgeVisual() {
  return (
    <div className={styles.frame}>
      <svg viewBox="0 0 640 380" aria-hidden="true" className={styles.scene}>
        <defs>
          <marker id="bridge-arrow-right" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-accent)" />
          </marker>
          <marker id="bridge-arrow-left" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#2f6fed" />
          </marker>
        </defs>

        <EditorialFigure x={78} y={330} scale={1.5} />
        <EditorialFigure x={562} y={330} scale={1.5} flip />

        {SIGNAL_Y.map((y, index) => {
          const rightward = index < 3;
          return (
            <line
              key={y}
              x1={rightward ? 150 : 490}
              y1={y}
              x2={rightward ? 490 : 150}
              y2={y}
              className={rightward ? styles.signalRight : styles.signalLeft}
              markerEnd={`url(#bridge-arrow-${rightward ? "right" : "left"})`}
            />
          );
        })}
      </svg>

      <span className={`text-label ${styles.side} ${styles.sideLeft}`}>{CUSTOMER_PROVIDER_BRIDGE.sides.left}</span>
      <span className={`text-label ${styles.side} ${styles.sideRight}`}>{CUSTOMER_PROVIDER_BRIDGE.sides.right}</span>

      {CUSTOMER_PROVIDER_BRIDGE.signals.map((signal, index) => (
        <span
          key={signal}
          className={`text-label ${styles.signalLabel}`}
          style={{ top: `${(SIGNAL_Y[index]! / 380) * 100}%` }}
        >
          {signal}
        </span>
      ))}
    </div>
  );
}
