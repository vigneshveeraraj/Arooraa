import type { DetailSection } from "@/lib/admin/project-enquiry-sections";
import styles from "./panels.module.css";
import detailStyles from "./DetailSectionCard.module.css";

/** One "Customer" / "Project Direction" / "Attribution" etc. card (W3.2D.1
 * Phase 8) — a plain label/value list, since every field here is already a
 * short backend-provided string. */
export function DetailSectionCard({ title, rows }: DetailSection) {
  if (rows.length === 0) return null;

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      <dl className={detailStyles.list}>
        {rows.map((row) => (
          <div key={row.label} className={detailStyles.row}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
