import type { ReactNode } from "react";
import styles from "./MindraPhoneMockup.module.css";

interface MindraPhoneMockupProps {
  /** Small in-screen label, e.g. "Today" — not a status bar, just a screen title. */
  label?: string;
  children: ReactNode;
  /** "wide" gives a flagship companion visual a bit more presence than the default frame. */
  size?: "default" | "wide";
  /** Tints the frame border with the accent color instead of the neutral border. */
  accent?: boolean;
  className?: string;
}

/**
 * Shared phone-frame chrome (P3.2) used by every Mindra "app glimpse"
 * visual — one consistent rounded frame + soft screen surface, so Hero,
 * What Mindra Does, My Space/Family Space, Privacy & Trust and Product
 * Vision all read as the same coherent visual system rather than one-off
 * illustrations. Deliberately not a production screenshot: no status bar,
 * no clock, no signal/battery indicators, no OS chrome — just a calm,
 * conceptual "glimpse" of a screen, matching the brief's own restriction
 * against anything that could be mistaken for a real captured screenshot.
 *
 * `size`/`accent` are real variant props (not a free-form className
 * override) specifically so a consumer overriding this component's own
 * width/border doesn't depend on cross-file CSS cascade order — both
 * variant classes live in this same stylesheet, after `.phone`, so their
 * override always wins deterministically.
 */
export function MindraPhoneMockup({ label, children, size = "default", accent = false, className }: MindraPhoneMockupProps) {
  const classes = [
    styles.phone,
    size === "wide" ? styles.phoneWide : "",
    accent ? styles.phoneAccent : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <div className={styles.screen}>
        {label ? <p className={styles.screenLabel}>{label}</p> : null}
        <div className={styles.screenBody}>{children}</div>
      </div>
    </div>
  );
}
