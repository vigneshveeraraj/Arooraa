import type { ComponentType } from "react";
import { DAY_RHYTHM_MOMENTS } from "@/lib/content/work-detail/smart-mirror";
import { DoorIcon, MirrorIcon, MoonIcon, SunIcon } from "./SmartMirrorIcons";
import styles from "./DayRhythmStoryboard.module.css";

const MOMENT_CLASS = ["morning", "leaving", "evening", "quiet"] as const;
const MOMENT_ICONS: ComponentType[] = [SunIcon, DoorIcon, MoonIcon, MirrorIcon];
// Content density recedes across the day: two cues, then one, then one
// calmer cue, then none — the mirror visibly returns to being a mirror.
const MOMENT_CUES = [2, 1, 1, 0];

/**
 * Chapter 9 — a cinematic 2×2 (desktop) / stacked (mobile) day-rhythm
 * storyboard: each frame is its own small mirror scene whose atmosphere
 * (light → dim → near-dark) and content density (two cues → one → one
 * calmer cue → none) carry the progression, not just a card label.
 */
export function DayRhythmStoryboard() {
  return (
    <ol className={styles.grid} aria-label="Smart Mirror moving through a day">
      {DAY_RHYTHM_MOMENTS.map((moment, index) => {
        const cls = MOMENT_CLASS[index] ?? "quiet";
        const cueCount = MOMENT_CUES[index] ?? 0;
        const Icon = MOMENT_ICONS[index] ?? MirrorIcon;
        return (
          <li key={moment.name} className={styles.frame}>
            <div className={`${styles.mirror} ${styles[cls]}`} aria-hidden="true">
              <span className={styles.sheen} />
              <span className={styles.timeIcon}>
                <Icon />
              </span>
              {Array.from({ length: cueCount }).map((_, cueIndex) => (
                <span key={cueIndex} className={styles.cue} style={{ top: `${44 + cueIndex * 16}%` }} />
              ))}
            </div>
            <p className={styles.name}>{moment.name}</p>
            <p className={styles.description}>{moment.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
