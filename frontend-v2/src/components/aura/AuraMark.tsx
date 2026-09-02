import type { AuraState } from "@/lib/aura/state";
import styles from "./AuraMark.module.css";

interface AuraMarkProps {
  state: AuraState;
  /** Overrides the mark's size where a larger presence is wanted (the panel header). */
  size?: number;
  className?: string;
}

/**
 * Aura's visual presence — an abstract mark, deliberately not a speech bubble, a robot or an
 * avatar. It carries the state model (see {@link AuraState}) as three restrained layers rather
 * than as constant movement, and it is purely decorative: the state is announced in text elsewhere,
 * so this is hidden from assistive technology.
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
      <span className={styles.halo} />
      <span className={styles.sweep} />
      <span className={styles.core} />
    </span>
  );
}
