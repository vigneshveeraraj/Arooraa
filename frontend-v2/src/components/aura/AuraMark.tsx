import type { AuraState } from "@/lib/aura/state";
import styles from "./AuraMark.module.css";

interface AuraMarkProps {
  state: AuraState;
  /** Overrides the mark's size where a larger presence is wanted (the panel header). */
  size?: number;
  className?: string;
}

/**
 * The Aura Spark — AROORAA's digital assistant, drawn as a small core with four asymmetric rays
 * rather than a circular orb, a chat bubble or a robot face. The core is a rounded square (the same
 * family of shape as the small accent marks beside the AROORAA wordmark), and the rays are
 * deliberately uneven in length, width and spacing — one dominant flow, three descending accents —
 * so the mark reads as a controlled, directional presence rather than a symmetric pinwheel or a
 * glowing ball.
 *
 * <p>It carries the state model (see {@link AuraState}) as restraint rather than as constant
 * movement: idle is genuinely still, and every animated state still reads correctly with
 * prefers-reduced-motion off entirely (colour and scale carry the same information). Purely
 * decorative — the state is announced in text elsewhere — so it is hidden from assistive
 * technology.
 *
 * <p>A4 stops here on purpose. The later digital-humanoid work replaces what is inside this
 * component; everything around it already talks to it through one `state` prop.
 */
export function AuraMark({ state, size, className }: AuraMarkProps) {
  return (
    <span
      className={[styles.mark, className].filter(Boolean).join(" ")}
      data-state={state}
      aria-hidden="true"
      style={size ? ({ "--aura-mark-size": `${size}px` } as React.CSSProperties) : undefined}
    >
      <svg viewBox="0 0 32 32" width="100%" height="100%" focusable="false">
        <g className={styles.rays}>
          {/* The dominant flow ray — the mark's one clear direction. */}
          <rect className={styles.rayLong} x="14.2" y="2.3" width="3.6" height="10.5" rx="1.8"
                transform="rotate(335 16 16)" />
          <rect className={styles.rayMedium} x="14.5" y="5.3" width="3" height="7.5" rx="1.5"
                transform="rotate(95 16 16)" />
          <rect className={styles.raySmall} x="14.75" y="7" width="2.5" height="5.8" rx="1.25"
                transform="rotate(195 16 16)" />
          <rect className={styles.rayTiny} x="15" y="8.6" width="2" height="4.2" rx="1"
                transform="rotate(245 16 16)" />
        </g>
        {/* The core sits on top, covering where the rays converge — one small intelligent point,
            not a ring around empty space. */}
        <rect className={styles.core} x="12.5" y="12.5" width="7" height="7" rx="2.2"
              transform="rotate(45 16 16)" />
      </svg>
    </span>
  );
}
