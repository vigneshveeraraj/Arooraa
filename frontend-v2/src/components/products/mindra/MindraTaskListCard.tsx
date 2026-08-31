import styles from "./MindraTaskListCard.module.css";

export type MindraItemKind = "task" | "grocery" | "meal" | "note" | "family";

interface MindraTaskListCardProps {
  label: string;
  kind: MindraItemKind;
  /** Small, restrained status word — e.g. "Today", "Due", "Shared", "Done", "Family". Neutral styling, not a colored badge, so it never competes with the dot's own category color. */
  tag?: string;
}

/**
 * A single colored row inside a MindraPhoneMockup screen or the
 * MindraLifeDashboard bento grid (P3.2, "family" kind + `tag` added in the
 * signature-dashboard milestone) — the reusable building block every
 * phone-glimpse and dashboard-card visual composes from. Color is semantic
 * and reuses existing design tokens rather than introducing new ones: "task"
 * reuses the brand accent, "grocery" reuses the existing success token,
 * "meal" (which also covers reminders, per the visual brief) reuses the
 * existing warning token, "note" is a restrained accent tint (color-mix, not
 * a new hue) for personal/family items, and "family" reuses the existing
 * error token purely for its soft-red/coral hue (no error meaning implied —
 * there is no icon or wording suggesting a problem, just a distinct warm
 * accent for attention-worthy family items). No new global color was added
 * anywhere in this milestone.
 */
export function MindraTaskListCard({ label, kind, tag }: MindraTaskListCardProps) {
  return (
    <div className={`${styles.row} ${styles[kind]}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      {tag ? <span className={styles.tag}>{tag}</span> : null}
    </div>
  );
}
