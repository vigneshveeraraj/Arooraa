"use client";

import { type FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import {
  CONTEXT_AWARE_COPY,
  DRAFT_RESTORED_MESSAGE,
  START_PROJECT_PHILOSOPHY,
  STEP1_HEADING,
  STEP2_HEADING,
  STEP3_HEADING,
} from "@/lib/content/start-project";
import type { ProjectEnquiryAdapter } from "@/lib/start-project/adapter";
import { STEP_COUNT, useStartProjectForm } from "./useStartProjectForm";
import { ProgressIndicator } from "./ProgressIndicator";
import { StepDirection } from "./StepDirection";
import { StepSituation } from "./StepSituation";
import { StepContact } from "./StepContact";
import { ReviewStep } from "./ReviewStep";
import { SuccessState } from "./SuccessState";
import styles from "./StartProjectForm.module.css";

const STEP_HEADINGS = [STEP1_HEADING, STEP2_HEADING, STEP3_HEADING];

interface StartProjectFormProps {
  /** Override point for tests — the real page never passes this, so it
   * always gets the local, backend-free adapter. */
  adapter?: ProjectEnquiryAdapter;
}

export function StartProjectForm({ adapter }: StartProjectFormProps = {}) {
  const {
    values,
    currentStep,
    phase,
    fieldErrors,
    submission,
    attribution,
    draftRestored,
    setField,
    toggleProductType,
    goNext,
    goBack,
    goToStep,
    submit,
    reset,
  } = useStartProjectForm(adapter);

  const contextNote = attribution.sourceContext ? CONTEXT_AWARE_COPY[attribution.sourceContext] : undefined;

  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStep, phase]);

  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return;
    const container = formRef.current;
    if (!container) return;
    const target =
      container.querySelector<HTMLElement>('[aria-invalid="true"]') ?? container.querySelector<HTMLElement>('[role="alert"]');
    target?.focus();
  }, [fieldErrors]);

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (phase === "review") {
      void submit();
    } else {
      goNext();
    }
  };

  if (phase === "success" && submission.status === "success") {
    return <SuccessState values={values} submission={submission} onStartOver={reset} />;
  }

  return (
    <form ref={formRef} id="start-project-form" tabIndex={-1} onSubmit={handleFormSubmit} noValidate className={styles.form}>
      {phase === "form" && draftRestored ? (
        <p className={styles.draftRestoredNote} role="status">
          {DRAFT_RESTORED_MESSAGE}
        </p>
      ) : null}

      {phase === "form" ? (
        <>
          <ProgressIndicator currentStep={currentStep} />
          <p className={`text-label ${styles.philosophy}`}>{START_PROJECT_PHILOSOPHY}</p>
          <h2 ref={headingRef} tabIndex={-1} className={`text-h2 ${styles.stepHeading}`}>
            {STEP_HEADINGS[currentStep]}
          </h2>
          {currentStep === 0 && contextNote ? <p className={`text-body ${styles.contextNote}`}>{contextNote}</p> : null}
        </>
      ) : (
        <h2 ref={headingRef} tabIndex={-1} className={styles.srOnlyHeading}>
          Review your project enquiry
        </h2>
      )}

      {phase === "form" && currentStep === 0 && (
        <StepDirection
          solutionModel={values.solutionModel}
          engagementModel={values.engagementModel}
          errors={fieldErrors}
          onSolutionModelChange={(v) => setField("solutionModel", v)}
          onEngagementModelChange={(v) => setField("engagementModel", v)}
        />
      )}

      {phase === "form" && currentStep === 1 && (
        <StepSituation values={values} errors={fieldErrors} setField={setField} toggleProductType={toggleProductType} />
      )}

      {phase === "form" && currentStep === 2 && <StepContact values={values} errors={fieldErrors} setField={setField} />}

      {phase === "review" && <ReviewStep values={values} submission={submission} onEdit={goToStep} onSubmit={() => void submit()} />}

      {phase === "form" ? (
        <div className={styles.navRow}>
          {currentStep > 0 ? (
            <Button type="button" variant="secondary" onClick={goBack}>
              Back
            </Button>
          ) : null}
          <Button type="submit" variant="primary">
            {currentStep === STEP_COUNT - 1 ? "Review Your Enquiry" : "Continue"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
