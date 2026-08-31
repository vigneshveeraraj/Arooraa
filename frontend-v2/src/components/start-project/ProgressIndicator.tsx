import { WIZARD_STEP_LABELS } from "@/lib/content/start-project";
import styles from "./ProgressIndicator.module.css";

interface ProgressIndicatorProps {
  currentStep: number;
}

/** Subtle "01 Direction → 02 Context → 03 Contact" progress (W3.2A §5) —
 * deliberately restrained, not a banking/KYC-style stepper. */
export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <ol className={styles.progress} aria-label="Form progress">
      {WIZARD_STEP_LABELS.map((label, index) => (
        <li
          key={label}
          className={`${styles.step} ${index === currentStep ? styles.active : ""} ${index < currentStep ? styles.done : ""}`}
          aria-current={index === currentStep ? "step" : undefined}
        >
          <span className={styles.dot} aria-hidden="true">
            {index < currentStep ? "✓" : String(index + 1).padStart(2, "0")}
          </span>
          <span className={styles.label}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
