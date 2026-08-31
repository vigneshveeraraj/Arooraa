import { PROOF_CAPABILITIES, PROOF_CONCLUSION } from "@/lib/content/work-detail/mesa";
import styles from "./ProofCapabilitiesVisual.module.css";

const SIZE_CLASSES = ["sizeLg", "sizeSm", "sizeMd", "sizeSm", "sizeMd", "sizeLg", "sizeSm", "sizeMd", "sizeSm", "sizeMd"] as const;

/**
 * Chapter 15's closing proof — the ten capability areas as a varied-size
 * editorial word constellation (not ten equal badges), followed by the
 * carefully factual closing statement about what MESA demonstrates about
 * AROORAA more broadly.
 */
export function ProofCapabilitiesVisual() {
  return (
    <div className={styles.wrapper}>
      <ul className={styles.constellation}>
        {PROOF_CAPABILITIES.map((capability, index) => (
          <li key={capability} className={`${styles.term} ${styles[SIZE_CLASSES[index] ?? "sizeMd"]}`}>
            {capability}
          </li>
        ))}
      </ul>
      <p className={`text-body-lg ${styles.conclusion}`}>{PROOF_CONCLUSION}</p>
    </div>
  );
}
