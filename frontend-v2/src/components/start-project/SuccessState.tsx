import { CONTACT_METHOD_OPTIONS, START_OVER_LABEL, SUCCESS_HEADING, SUCCESS_NEXT_STEPS } from "@/lib/content/start-project";
import { maskPhone, toE164 } from "@/lib/start-project/validation";
import type { StartProjectFormValues, SubmissionState } from "@/lib/start-project/types";
import { Button } from "@/components/ui/Button";
import styles from "./SuccessState.module.css";

interface SuccessStateProps {
  values: StartProjectFormValues;
  submission: Extract<SubmissionState, { status: "success" }>;
  onStartOver: () => void;
}

/**
 * The complete success experience (W3.2A §25, hardened in W3.2A.1 §18–22) —
 * reference-ready (renders a Reference block only when the adapter
 * actually returns one, which the current local adapter deliberately
 * never does) rather than a generic "Thank you." The contact-details grid
 * uses `minmax(0, 1fr)` tracks with `overflow-wrap` on every value so a
 * long email can never overlap the phone/preferred-contact columns next
 * to it (root cause of the reported overlap: `minmax(160px, 1fr)` tracks
 * have an implicit content-based minimum that a long, unbreakable email
 * string can force wider than the column, squeezing its neighbours).
 */
export function SuccessState({ values, submission, onStartOver }: SuccessStateProps) {
  const preferredMethodLabel = CONTACT_METHOD_OPTIONS.find((o) => o.value === values.preferredContactMethod)?.label;
  // The canonical E.164 value is what should ever be masked/displayed here —
  // `values.phone` is only ever the national number the visitor typed.
  const canonicalPhone = toE164(values.phone, values.country) ?? values.phone;

  return (
    <div className={styles.wrap}>
      <h2 className="text-h2">{SUCCESS_HEADING}</h2>
      <p className={`text-body-lg ${styles.supporting}`}>{submission.message}</p>

      {submission.referenceNumber ? (
        <p className={styles.reference}>
          Reference: <strong>{submission.referenceNumber}</strong>
        </p>
      ) : null}

      <dl className={styles.details}>
        <div>
          <dt>Contact email</dt>
          <dd>{values.email}</dd>
        </div>
        <div>
          <dt>Contact number</dt>
          <dd>{maskPhone(canonicalPhone)}</dd>
        </div>
        {preferredMethodLabel ? (
          <div>
            <dt>Preferred contact</dt>
            <dd>{preferredMethodLabel}</dd>
          </div>
        ) : null}
      </dl>

      <div className={styles.nextSteps}>
        <p className={`text-label ${styles.nextStepsLabel}`}>What happens next</p>
        <ol>
          {SUCCESS_NEXT_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className={styles.startOver}>
        <Button variant="secondary" onClick={onStartOver}>
          {START_OVER_LABEL}
        </Button>
      </div>
    </div>
  );
}
