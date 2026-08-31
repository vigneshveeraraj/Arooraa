import { MindraTaskListCard, type MindraItemKind } from "./MindraTaskListCard";
import { MindraProgressRow } from "./MindraProgressRow";
import styles from "./MindraLifeDashboard.module.css";

const TODAY_ITEMS: { label: string; kind: MindraItemKind; tag: string }[] = [
  { label: "9:30 Appointment", kind: "task", tag: "Today" },
  { label: "6:00 Reminder", kind: "meal", tag: "Due" },
];

const FAMILY_ITEMS: { label: string; kind: MindraItemKind; tag: string }[] = [
  { label: "Buy vegetables", kind: "grocery", tag: "Shared" },
  { label: "Pay school fee", kind: "family", tag: "Family" },
];

const MEAL_ITEMS: { label: string; kind: MindraItemKind; tag?: string }[] = [
  { label: "Dinner tonight", kind: "meal", tag: "Today" },
  { label: "Lemon rice", kind: "meal" },
];

const NOTE_ITEMS: { label: string; kind: MindraItemKind }[] = [{ label: "3 notes", kind: "note" }];

/**
 * Mindra's signature flagship visual (P3.2) — a calm bento composition of
 * everyday-life cards, deliberately distinct from both the phone-mockup
 * family used elsewhere on the page and from MESA's network/hub visual
 * language. Replaces the P3.2-phone-mockup-milestone's MindraTodayBoard as
 * the companion visual for What Mindra Does, since a dedicated "Today"
 * phone screen became redundant once this dashboard's own Today's Plan
 * card existed — two near-identical concepts in the same section would
 * have added visual weight without adding meaning.
 *
 * All content is illustrative example data (sample appointment times, a
 * sample grocery count), not real product state or any kind of usage
 * metric. Every capability area this represents (Today, Family
 * Coordination, Groceries, Meal Planning, Personal Memory) already exists
 * as real, visible text in the adjacent feature grid, so the whole
 * dashboard stays aria-hidden — nothing here introduces new meaning that
 * isn't already stated as real text elsewhere on the page.
 */
export function MindraLifeDashboard() {
  return (
    <div className={styles.dashboard} aria-hidden="true">
      <p className={styles.dashboardLabel}>Mindra Today</p>
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.cardToday}`}>
          <p className={styles.cardTitle}>Today&apos;s Plan</p>
          <div className={styles.cardRows}>
            {TODAY_ITEMS.map((item) => (
              <MindraTaskListCard key={item.label} label={item.label} kind={item.kind} tag={item.tag} />
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardFamily}`}>
          <p className={styles.cardTitle}>Family Tasks</p>
          <div className={styles.cardRows}>
            {FAMILY_ITEMS.map((item) => (
              <MindraTaskListCard key={item.label} label={item.label} kind={item.kind} tag={item.tag} />
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardCompact}`}>
          <p className={styles.cardTitle}>Groceries</p>
          <MindraProgressRow current={3} total={6} />
        </div>

        <div className={`${styles.card} ${styles.cardCompact}`}>
          <p className={styles.cardTitle}>Meal Plan</p>
          <div className={styles.cardRows}>
            {MEAL_ITEMS.map((item) => (
              <MindraTaskListCard key={item.label} label={item.label} kind={item.kind} tag={item.tag} />
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardCompact}`}>
          <p className={styles.cardTitle}>My Space</p>
          <div className={styles.cardRows}>
            {NOTE_ITEMS.map((item) => (
              <MindraTaskListCard key={item.label} label={item.label} kind={item.kind} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
