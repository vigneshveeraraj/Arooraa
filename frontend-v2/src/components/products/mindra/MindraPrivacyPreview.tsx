import { MindraPhoneMockup } from "./MindraPhoneMockup";
import { MindraTaskListCard, type MindraItemKind } from "./MindraTaskListCard";

const PRIVACY_ROWS: { label: string; kind: MindraItemKind }[] = [
  { label: "Personal notes stay private", kind: "note" },
  { label: "Household tasks are shared", kind: "task" },
  { label: "Groceries are shared", kind: "grocery" },
];

/**
 * A phone-glimpse companion visual for Privacy & Trust (P3.2) — a calm,
 * settings-style screen restating the section's own private/shared meaning
 * in a different, illustrative form (not new information, not internal
 * mechanics). The real trust points live in the section's own badge list;
 * this is purely decorative, so the whole preview stays aria-hidden.
 */
export function MindraPrivacyPreview() {
  return (
    <div aria-hidden="true">
      <MindraPhoneMockup label="Privacy">
        {PRIVACY_ROWS.map((row) => (
          <MindraTaskListCard key={row.label} label={row.label} kind={row.kind} />
        ))}
      </MindraPhoneMockup>
    </div>
  );
}
