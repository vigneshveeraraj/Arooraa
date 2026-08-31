import { MindraPhoneMockup } from "./MindraPhoneMockup";
import { MindraTaskListCard, type MindraItemKind } from "./MindraTaskListCard";
import styles from "./MindraSharedSpacesPreview.module.css";

const MY_SPACE_ITEMS: { label: string; kind: MindraItemKind }[] = [
  { label: "Private reminder", kind: "note" },
  { label: "A personal note", kind: "note" },
];

const FAMILY_SPACE_ITEMS: { label: string; kind: MindraItemKind }[] = [
  { label: "Shared shopping", kind: "grocery" },
  { label: "Family note", kind: "note" },
  { label: "Home tasks", kind: "task" },
];

/**
 * Original Mindra-specific visual for the My Space / Family Space section
 * (P3 Visual B, P3.1 added the "shared deliberately" cue, P3.2 replaces the
 * plain two-panel layout with a pair of small phone glimpses so the section
 * has more visual life). The real explanation of what each space means
 * stays exactly as before — real, accessible text, since the template's
 * ListBlock only carries two short badges for this section. The phone
 * mockups underneath are illustrative example content only (not stated
 * elsewhere as fact), so they stay aria-hidden — only the captions and the
 * "shared deliberately" cue are in the accessibility tree.
 */
export function MindraSharedSpacesPreview() {
  return (
    <div className={styles.spaces}>
      <div className={styles.column}>
        <p className={`text-eyebrow ${styles.panelLabel}`}>My Space</p>
        <p className={styles.panelBody}>Personal information stays private to you.</p>
        <div aria-hidden="true">
          <MindraPhoneMockup>
            {MY_SPACE_ITEMS.map((item) => (
              <MindraTaskListCard key={item.label} label={item.label} kind={item.kind} />
            ))}
          </MindraPhoneMockup>
        </div>
      </div>

      <div className={styles.bridge}>
        <span className={styles.bridgeLine} aria-hidden="true" />
        <span className={styles.bridgeLabel}>shared deliberately</span>
        <span className={styles.bridgeLine} aria-hidden="true" />
      </div>

      <div className={styles.column}>
        <p className={`text-eyebrow ${styles.panelLabel}`}>Family Space</p>
        <p className={styles.panelBody}>Shared household information is visible only to your trusted household.</p>
        <div aria-hidden="true">
          <MindraPhoneMockup accent>
            {FAMILY_SPACE_ITEMS.map((item) => (
              <MindraTaskListCard key={item.label} label={item.label} kind={item.kind} />
            ))}
          </MindraPhoneMockup>
        </div>
      </div>
    </div>
  );
}
