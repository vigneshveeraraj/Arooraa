import { MindraPhoneMockup } from "./MindraPhoneMockup";
import { MindraTaskListCard, type MindraItemKind } from "./MindraTaskListCard";

const CATEGORIES: { label: string; kind: MindraItemKind }[] = [
  { label: "Personal", kind: "note" },
  { label: "Family", kind: "task" },
  { label: "Groceries", kind: "grocery" },
  { label: "Meals", kind: "meal" },
];

/**
 * A subtle phone-glimpse companion visual for Product Vision (P3.2) — a
 * calm "organized categories" screen, illustrating the section's own idea
 * that personal and shared information should be structured and easy to
 * find, without restating any specific claim as new fact. Product Vision
 * still reads as text-led (the P3.1 "editorial" treatment only applies
 * when a section has no visual, so passing one here intentionally reverts
 * this section to the standard two-column story row). Purely decorative,
 * so the whole preview stays aria-hidden.
 */
export function MindraOrganizedLifePreview() {
  return (
    <div aria-hidden="true">
      <MindraPhoneMockup label="Organized">
        {CATEGORIES.map((category) => (
          <MindraTaskListCard key={category.label} label={category.label} kind={category.kind} />
        ))}
      </MindraPhoneMockup>
    </div>
  );
}
