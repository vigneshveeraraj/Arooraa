import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { WHY_AROORAA } from "@/lib/content/about";
import styles from "./FrictionToDirectionVisual.module.css";

const SPARK_PATH =
  "M12 1 C12.9 7.1 16.9 11.1 23 12 C16.9 12.9 12.9 16.9 12 23 C11.1 16.9 7.1 12.9 1 12 C7.1 11.1 11.1 7.1 12 1 Z";

/**
 * Chapter 01's signature visual (W3.1 §6) — a page from a product-thinking
 * notebook becoming a real system: disconnected customer/provider figures
 * repeating the same friction on the left, a bright observation point in
 * the middle, and one clean, bridged, structured system on the right. The
 * SVG scene is decorative; the three zone captions are real text below it.
 */
export function FrictionToDirectionVisual() {
  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 640 360" aria-hidden="true" className={styles.scene}>
        <defs>
          <radialGradient id="friction-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="212" height="360" className={styles.zoneFriction} />
        <rect x="392" y="0" width="248" height="360" className={styles.zoneDirection} />

        {/* Zone 1 — repeated friction */}
        <circle cx="168" cy="72" r="30" className={styles.loop} />
        <rect x="36" y="56" width="28" height="18" rx="3" className={styles.duplicate} />
        <rect x="42" y="80" width="28" height="18" rx="3" className={styles.duplicate} />
        <EditorialFigure x={64} y={260} scale={1.05} />
        <EditorialFigure x={156} y={260} scale={1.05} flip />
        <line x1="86" y1="208" x2="108" y2="208" className={styles.brokenConnector} />
        <line x1="120" y1="208" x2="140" y2="208" className={styles.brokenConnector} />

        {/* Zone 2 — observation */}
        <circle cx="300" cy="178" r="92" fill="url(#friction-glow)" />
        <path d="M170 200 C 220 195, 260 185, 284 178" className={styles.converge} />
        <path d="M64 200 C 150 220, 230 200, 284 180" className={styles.converge} />
        <path d={SPARK_PATH} transform="translate(280,148) scale(1.7)" className={styles.spark} />

        {/* Zone 3 — product direction */}
        <line x1="316" y1="178" x2="428" y2="178" className={styles.resolveLine} />
        <rect x="430" y="90" width="150" height="60" rx="12" className={styles.customerView} />
        <rect x="430" y="210" width="150" height="60" rx="12" className={styles.providerView} />
        <line x1="505" y1="150" x2="505" y2="210" className={styles.connectorLine} />
        <circle cx="505" cy="180" r="6" className={styles.connectorNode} />
      </svg>

      <div className={styles.captions}>
        <p className={`text-label ${styles.caption}`}>{WHY_AROORAA.visualZones.friction}</p>
        <p className={`text-label ${styles.caption}`}>{WHY_AROORAA.visualZones.observation}</p>
        <p className={`text-label ${styles.caption}`}>{WHY_AROORAA.visualZones.direction}</p>
      </div>
    </div>
  );
}
