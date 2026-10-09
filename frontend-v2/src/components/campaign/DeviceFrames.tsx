import type { ReactNode } from "react";
import styles from "./DeviceFrames.module.css";

/**
 * Device frames for the campaign's website mockups.
 *
 * A DeviceStage is a fixed-aspect box whose children are positioned in % and sized in
 * container units (cqi), so the whole composition — devices, the websites inside them
 * and their annotations — scales as one piece at every width and can never reflow into
 * the copy beside it. The websites inside are real HTML, so their text stays sharp on
 * high-density screens; only the photographs are bitmaps.
 */

export function DeviceStage({ variant, children }: { variant: "hero" | "concept"; children: ReactNode }) {
  return <div className={`${styles.stage} ${styles[variant]}`}>{children}</div>;
}

export function Laptop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.laptop} aria-hidden="true">
      <div className={styles.laptopScreen}>{children}</div>
      <div className={styles.laptopBase} />
    </div>
  );
}

export function BrowserWindow({ address, children }: { address: string; children: ReactNode }) {
  return (
    <div className={styles.browser} aria-hidden="true">
      <div className={styles.browserChrome}>
        <i />
        <i />
        <i />
        <span>{address}</span>
      </div>
      <div className={styles.browserViewport}>{children}</div>
    </div>
  );
}

export function Phone({ children }: { children: ReactNode }) {
  return (
    <div className={styles.phone} aria-hidden="true">
      <div className={styles.phoneScreen}>{children}</div>
    </div>
  );
}
