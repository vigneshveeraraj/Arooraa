import type { ReactNode } from "react";
import styles from "./SmartMirrorFrame.module.css";

interface SmartMirrorFrameProps {
  children: ReactNode;
  size?: "default" | "large";
  className?: string;
}

/**
 * Shared Smart Mirror device illustration (P4) — one consistent frame used
 * across every scene visual (hero, morning, evening, dashboard) so the page
 * reads as one coherent hardware family rather than four different mirror
 * designs, per the brief's explicit requirement. Original, hand-built
 * SVG/CSS: a rounded rectangular frame with a refined thin dark bezel, a
 * soft ambient glow behind it (suggesting "in a room" without a literal
 * photo), and a reflective-surface gradient behind whatever glanceable UI
 * content is passed as children. Deliberately abstract rather than
 * photorealistic — no stock imagery, no third-party device likeness.
 */
export function SmartMirrorFrame({ children, size = "default", className }: SmartMirrorFrameProps) {
  return (
    <div className={[styles.scene, size === "large" ? styles.sceneLarge : "", className].filter(Boolean).join(" ")}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.frame}>
        <div className={styles.glass}>{children}</div>
      </div>
    </div>
  );
}
