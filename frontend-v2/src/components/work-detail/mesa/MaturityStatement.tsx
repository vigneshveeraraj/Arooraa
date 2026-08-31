import { MATURITY_STATEMENT } from "@/lib/content/work-detail/mesa";
import styles from "./MaturityStatement.module.css";

/**
 * Chapter 14 — a deliberately simple, honest maturity statement: no visual
 * metaphor needed here, just the same badge treatment used sitewide and one
 * plain paragraph. No launch scale, customer counts, or usage data.
 */
export function MaturityStatement() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.badge}>{MATURITY_STATEMENT.label}</span>
      <p className={`text-body-lg ${styles.body}`}>{MATURITY_STATEMENT.body}</p>
    </div>
  );
}
