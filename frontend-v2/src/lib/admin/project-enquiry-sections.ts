/**
 * Groups the backend's flat, ordered submittedFields map (see
 * AdminLeadQueryService.projectDetail — unchanged, backend is frozen) into
 * the named sections W3.2D.1 Phase 8 asks for, purely for display. This
 * does not add, remove or infer any data — every value still comes
 * directly from the backend; unrecognized keys (a MESA_DEMO row's fields,
 * or any future backend addition) fall into "Additional details" rather
 * than being silently dropped.
 *
 * Only ever called for leadType === "PROJECT_ENQUIRY" — MESA_DEMO detail
 * keeps the flat list, since these section names are specific to the
 * project-enquiry submission shape.
 */

export interface DetailSection {
  title: string;
  rows: { label: string; value: string }[];
}

const SECTION_KEYS: { title: string; keys: string[] }[] = [
  { title: "Contact Preference", keys: ["Preferred contact method", "Preferred contact time", "WhatsApp consent"] },
  { title: "Project Direction", keys: ["Solution model", "Service type", "Project type"] },
  { title: "Problem / Opportunity", keys: ["Problem statement", "Description"] },
  { title: "Engagement", keys: ["Engagement model"] },
  { title: "Stage", keys: ["Project stage", "Existing system"] },
  { title: "Products / Platforms", keys: ["Product types"] },
  { title: "Timeline", keys: ["Timeline"] },
  { title: "Budget", keys: ["Budget range"] },
  { title: "Existing System Context", keys: ["Existing system context"] },
];

const ATTRIBUTION_KEYS = [
  "Source",
  "Source page",
  "Entry route",
  "Referrer",
  "UTM source",
  "UTM medium",
  "UTM campaign",
  "UTM content",
  "Source context",
];

/** Rendered separately (header/Customer section), never repeated in the grouped body. */
const HANDLED_ELSEWHERE = new Set(["Submission type", "Role", "Country code"]);

export function groupProjectEnquiryFields(fields: Record<string, string>): {
  sections: DetailSection[];
  attribution: DetailSection;
  additional: DetailSection;
} {
  const consumed = new Set<string>(HANDLED_ELSEWHERE);

  const sections = SECTION_KEYS.map(({ title, keys }) => {
    const rows = keys
      .map((key) => ({ label: key, value: fields[key] }))
      .filter((row): row is { label: string; value: string } => row.value !== undefined);
    for (const row of rows) consumed.add(row.label);
    return { title, rows };
  }).filter((section) => section.rows.length > 0);

  const attributionRows = ATTRIBUTION_KEYS.map((key) => ({ label: key, value: fields[key] })).filter(
    (row): row is { label: string; value: string } => row.value !== undefined,
  );
  for (const row of attributionRows) consumed.add(row.label);

  const additionalRows = Object.entries(fields)
    .filter(([key]) => !consumed.has(key))
    .map(([label, value]) => ({ label, value }));

  return {
    sections,
    attribution: { title: "Attribution", rows: attributionRows },
    additional: { title: "Additional details", rows: additionalRows },
  };
}
