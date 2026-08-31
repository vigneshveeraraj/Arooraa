import { MindraPhoneMockup } from "./MindraPhoneMockup";
import { MindraTaskListCard, type MindraItemKind } from "./MindraTaskListCard";
import styles from "./MindraHeroVisual.module.css";

const SCATTERED = ["Memory", "Task", "Grocery", "Meal Plan", "Family"];
const TODAY_ROWS: { label: string; kind: MindraItemKind }[] = [
  { label: "A task due", kind: "task" },
  { label: "Dinner tonight", kind: "meal" },
  { label: "Buy groceries", kind: "grocery" },
];

/**
 * Mindra's hero visual (P3, P3.2 gave the phone glimpse more visual life
 * via the shared MindraPhoneMockup/MindraTaskListCard primitives) —
 * deliberately not a MESA-style radial hub. A soft phone-shaped frame
 * holding one calm "Today" view with varied item colors, with a handful of
 * scattered note-like chips (the everyday things Mindra brings together)
 * drifting toward it. Warmer and softer than MESA's visual family: rounded
 * phone silhouette, gentle chip rotation, no sharp geometric icons. Always
 * rendered inside the template's aria-hidden hero-visual wrapper, so no
 * accessibility handling is needed here — the hero copy already states the
 * same facts in real text.
 */
export function MindraHeroVisual() {
  return (
    <div className={styles.scene}>
      <ul className={styles.chips}>
        {SCATTERED.map((chip, index) => (
          <li key={chip} className={styles.chip} data-tilt={index % 2 === 0 ? "left" : "right"}>
            {chip}
          </li>
        ))}
      </ul>

      <MindraPhoneMockup label="Today" className={styles.heroPhone}>
        {TODAY_ROWS.map((row) => (
          <MindraTaskListCard key={row.label} label={row.label} kind={row.kind} />
        ))}
      </MindraPhoneMockup>
    </div>
  );
}
