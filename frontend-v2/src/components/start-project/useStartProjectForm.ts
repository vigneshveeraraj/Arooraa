"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { captureAttribution } from "@/lib/start-project/attribution";
import { realProjectEnquiryAdapter, type ProjectEnquiryAdapter } from "@/lib/start-project/adapter";
import { buildSubmission } from "@/lib/start-project/build-submission";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "@/lib/start-project/idempotency";
import { clearDraft, hasMeaningfulDraft, loadDraft, saveDraft } from "@/lib/start-project/session-draft";
import {
  EMPTY_FORM_VALUES,
  type FormFieldErrors,
  type ProductType,
  type StartProjectFormValues,
  type SubmissionState,
} from "@/lib/start-project/types";
import { FIELD_TO_STEP, validateAll, validateStep } from "@/lib/start-project/validation";

export const STEP_COUNT = 3;
const SAVE_DEBOUNCE_MS = 400;

export type WizardPhase = "form" | "review" | "success";

/**
 * The Start Project wizard's state — accepts an adapter override so tests
 * can inject a failing/successful adapter without touching the network
 * (W3.2A §27). Defaults to the local, backend-free adapter that ships in
 * this milestone.
 *
 * Draft persistence (W3.2A.1 §10–17): the root cause of the reported
 * draft-loss bug was a race between restoring a saved draft and this same
 * hook's own save effect — on mount, both the "restore from sessionStorage"
 * effect and the "save values to sessionStorage" effect ran in the same
 * commit, and the save effect's closure still held the pre-restore (empty)
 * `values`, immediately overwriting the just-loaded draft with nothing.
 * `isDraftLoaded` closes that window: the save effect is a genuine no-op
 * until the restore effect has run at least once, so there is no commit in
 * which a stale empty value can ever reach sessionStorage.
 *
 * Defaults to the real backend adapter (W3.2B) — the live page never passes
 * an override, so it always submits for real; tests inject a local/mock
 * adapter instead (see StartProjectForm's `adapter` prop).
 */
export function useStartProjectForm(adapter: ProjectEnquiryAdapter = realProjectEnquiryAdapter) {
  const [values, setValues] = useState<StartProjectFormValues>(EMPTY_FORM_VALUES);
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<WizardPhase>("form");
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });
  const [draftRestored, setDraftRestored] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const attribution = useMemo(() => captureAttribution(), []);

  useEffect(() => {
    // Syncing from sessionStorage (an external system) once on mount — the
    // sanctioned effect pattern per react-hooks/set-state-in-effect's own guidance.
    const draft = loadDraft();
    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues((v) => ({ ...v, ...draft.values }));
      setCurrentStep(Math.min(Math.max(draft.currentStep, 0), STEP_COUNT - 1));
      if (hasMeaningfulDraft(draft)) setDraftRestored(true);
    }
    setIsDraftLoaded(true);
  }, []);

  // Keeps the latest values/step/phase available to the unmount-flush effect
  // below without needing them in its own dependency array.
  const latestRef = useRef({ values, currentStep, phase, isDraftLoaded });
  useEffect(() => {
    latestRef.current = { values, currentStep, phase, isDraftLoaded };
  });

  useEffect(() => {
    // Saves on both "form" (actively filling a step) and "review" (the
    // pre-submit summary) — the review screen's own fields never change,
    // but the *transition into* review is itself a values-independent
    // "phase changed" dependency update, and without this the debounced
    // save scheduled during the last field edit on Step 3 gets cancelled
    // by that transition before it ever fires, silently dropping the
    // draft the moment a submission fails (W3.2A.1 §24 Scenario G). Only
    // "success" is excluded, since clearDraft() has just run and a save
    // here would immediately resurrect the draft it just cleared.
    if (!isDraftLoaded || phase === "success") return;
    const timeoutId = window.setTimeout(() => saveDraft(values, currentStep), SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [values, currentStep, phase, isDraftLoaded]);

  useEffect(() => {
    // Guarantees the very latest values are flushed to sessionStorage even
    // if a debounced save was still pending when this component unmounts —
    // internal step navigation never unmounts this hook, but leaving the
    // page (route navigation, browser Back) does.
    return () => {
      const { values: v, currentStep: step, phase: p, isDraftLoaded: loaded } = latestRef.current;
      if (loaded && p !== "success") saveDraft(v, step);
    };
  }, []);

  const setField = useCallback(<K extends keyof StartProjectFormValues>(field: K, value: StartProjectFormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setFieldErrors((errs) => {
      if (!(field in errs)) return errs;
      const next = { ...errs };
      delete next[field];
      return next;
    });
  }, []);

  const toggleProductType = useCallback((type: ProductType) => {
    setValues((v) => {
      let next: ProductType[];
      if (type === "NOT_SURE") {
        next = v.productTypes.includes("NOT_SURE") ? [] : ["NOT_SURE"];
      } else {
        const withoutNotSure = v.productTypes.filter((t) => t !== "NOT_SURE");
        next = withoutNotSure.includes(type) ? withoutNotSure.filter((t) => t !== type) : [...withoutNotSure, type];
      }
      return { ...v, productTypes: next };
    });
  }, []);

  const goNext = useCallback(() => {
    const errors = validateStep(currentStep, values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    if (currentStep === STEP_COUNT - 1) {
      setPhase("review");
      // An immediate, non-debounced checkpoint save — entering review is a
      // natural "this is now final" moment, and a visitor can click Submit
      // (or a failing submission can land) well inside the normal debounce
      // window, which would otherwise drop the draft (W3.2A.1 §24 Scenario G).
      if (isDraftLoaded) saveDraft(values, currentStep);
    } else {
      setCurrentStep((s) => Math.min(s + 1, STEP_COUNT - 1));
    }
  }, [currentStep, values, isDraftLoaded]);

  const goBack = useCallback(() => {
    setFieldErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  /** Used by the review screen's per-section "Edit" links. */
  const goToStep = useCallback((step: number) => {
    setFieldErrors({});
    setPhase("form");
    setCurrentStep(step);
  }, []);

  const submit = useCallback(async () => {
    if (values.website.trim() !== "") {
      // Honeypot tripped — silently do nothing, matching the established pattern.
      return;
    }

    const errors = validateAll(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0] as keyof StartProjectFormValues | undefined;
      if (firstField) {
        setPhase("form");
        setCurrentStep(FIELD_TO_STEP[firstField]);
      }
      return;
    }

    setFieldErrors({});
    setSubmission({ status: "submitting" });

    const payload = buildSubmission(values, attribution);
    // Reused across retries of a failed attempt (network error, transient 5xx) so a
    // resubmit replays safely instead of risking a second row — only cleared below on
    // real success, or by reset() on an explicit "Start New Enquiry" (W3.2B §23, §36–37).
    const idempotencyKey = getOrCreateIdempotencyKey();
    const result = await adapter.submit(payload, idempotencyKey);

    if (result.ok) {
      setSubmission({ status: "success", message: result.message, referenceNumber: result.referenceNumber });
      setPhase("success");
      clearDraft();
      clearIdempotencyKey();
    } else {
      setSubmission({ status: "error", message: result.message });
    }
  }, [values, attribution, adapter]);

  /** Clears a stale error banner without discarding any field values. */
  const dismissError = useCallback(() => {
    setSubmission({ status: "idle" });
  }, []);

  /** Explicit "start over" (W3.2A.1 §15) — the only other action, besides a
   * successful submission, that's allowed to clear the draft. */
  const reset = useCallback(() => {
    clearDraft();
    clearIdempotencyKey();
    setValues(EMPTY_FORM_VALUES);
    setCurrentStep(0);
    setPhase("form");
    setFieldErrors({});
    setSubmission({ status: "idle" });
    setDraftRestored(false);
  }, []);

  return {
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
    dismissError,
    reset,
  };
}
