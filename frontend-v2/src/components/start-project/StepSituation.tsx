import {
  BUDGET_HEADING,
  BUDGET_RANGE_OPTIONS,
  BUDGET_SUPPORTING,
  EXISTING_SYSTEM_HEADING,
  EXISTING_SYSTEM_SUPPORTING,
  PROBLEM_HEADING,
  PROBLEM_HELPER,
  PROBLEM_PLACEHOLDER,
  PROBLEM_PROMPTS,
  PRODUCT_TYPE_HEADING,
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_TYPE_SUPPORTING,
  PROJECT_STAGE_HEADING,
  PROJECT_STAGE_OPTIONS,
  TIMELINE_HEADING,
  TIMELINE_OPTIONS,
} from "@/lib/content/start-project";
import { solutionModelNeedsExistingSystemContext } from "@/lib/start-project/validation";
import type { FormFieldErrors, ProductType, StartProjectFormValues } from "@/lib/start-project/types";
import { describedBy, FormField } from "./shared/FormField";
import { ChipOption } from "./shared/ChipOption";
import styles from "./StepSituation.module.css";

interface StepSituationProps {
  values: StartProjectFormValues;
  errors: FormFieldErrors;
  setField: <K extends keyof StartProjectFormValues>(field: K, value: StartProjectFormValues[K]) => void;
  toggleProductType: (type: ProductType) => void;
}

/** Step 2 — Tell us about the situation (W3.2A §9–15). */
export function StepSituation({ values, errors, setField, toggleProductType }: StepSituationProps) {
  const showExistingSystem = solutionModelNeedsExistingSystemContext(values.solutionModel);

  return (
    <div>
      <FormField
        label={PROBLEM_HEADING}
        htmlFor="problemStatement"
        required
        helper={PROBLEM_HELPER}
        error={errors.problemStatement}
        className={styles.textareaField}
      >
        <textarea
          id="problemStatement"
          name="problemStatement"
          rows={7}
          maxLength={3000}
          placeholder={PROBLEM_PLACEHOLDER}
          value={values.problemStatement}
          onChange={(e) => setField("problemStatement", e.target.value)}
          aria-invalid={!!errors.problemStatement}
          aria-describedby={describedBy("problemStatement", { helper: true, error: !!errors.problemStatement })}
        />
      </FormField>

      <div className={styles.prompts}>
        <p className={`text-label ${styles.promptsLabel}`}>You could mention…</p>
        <ul className={styles.promptsList}>
          {PROBLEM_PROMPTS.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{PROJECT_STAGE_HEADING}</legend>
        <div className={styles.chipRow}>
          {PROJECT_STAGE_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              name="projectStage"
              value={option.value}
              checked={values.projectStage === option.value}
              onChange={(v) => setField("projectStage", v as StartProjectFormValues["projectStage"])}
              label={option.label}
            />
          ))}
        </div>
        {errors.projectStage ? (
          <p role="alert" tabIndex={-1} className={styles.error}>
            {errors.projectStage}
          </p>
        ) : null}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{PRODUCT_TYPE_HEADING}</legend>
        <p className={`text-body-sm ${styles.supporting}`}>{PRODUCT_TYPE_SUPPORTING}</p>
        <div className={styles.chipRow}>
          {PRODUCT_TYPE_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              type="checkbox"
              name="productTypes"
              value={option.value}
              checked={values.productTypes.includes(option.value)}
              onChange={() => toggleProductType(option.value)}
              label={option.label}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{TIMELINE_HEADING}</legend>
        <div className={styles.chipRow}>
          {TIMELINE_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              name="timeline"
              value={option.value}
              checked={values.timeline === option.value}
              onChange={(v) => setField("timeline", v as StartProjectFormValues["timeline"])}
              label={option.label}
            />
          ))}
        </div>
        {errors.timeline ? (
          <p role="alert" tabIndex={-1} className={styles.error}>
            {errors.timeline}
          </p>
        ) : null}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{BUDGET_HEADING}</legend>
        <p className={`text-body-sm ${styles.supporting}`}>{BUDGET_SUPPORTING}</p>
        <div className={styles.chipRow}>
          {BUDGET_RANGE_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              name="budgetRange"
              value={option.value}
              checked={values.budgetRange === option.value}
              onChange={(v) => setField("budgetRange", v as StartProjectFormValues["budgetRange"])}
              label={option.label}
            />
          ))}
        </div>
      </fieldset>

      {showExistingSystem ? (
        <FormField
          label={EXISTING_SYSTEM_HEADING}
          htmlFor="existingSystemContext"
          helper={EXISTING_SYSTEM_SUPPORTING}
          className={styles.textareaField}
        >
          <textarea
            id="existingSystemContext"
            name="existingSystemContext"
            rows={3}
            value={values.existingSystemContext}
            onChange={(e) => setField("existingSystemContext", e.target.value)}
            aria-describedby={describedBy("existingSystemContext", { helper: true })}
          />
        </FormField>
      ) : null}
    </div>
  );
}
