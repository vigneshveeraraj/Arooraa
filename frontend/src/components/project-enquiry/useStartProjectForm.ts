import { useCallback, useEffect, useState } from "react";
import { submitProjectEnquiry } from "./api";
import { EMPTY_FORM_VALUES, type FormFieldErrors, type ProjectEnquiryFormValues, type SubmissionState } from "./types";
import { FIELD_TO_STEP, validateStep } from "./validation";
import type { ServiceTypeOption } from "./types";

const VALID_SERVICE_TYPES: ServiceTypeOption[] = [
  "IDEA_PRODUCT_CONSULTING",
  "WEBSITE_DIGITAL_PLATFORM",
  "CUSTOM_SOFTWARE",
  "SAAS_PRODUCT",
  "MOBILE_APPLICATION",
  "AI_AUTOMATION",
  "APPLICATION_MODERNIZATION",
  "CLOUD_DEVOPS",
  "NOT_SURE",
];

export const STEP_COUNT = 4;

export function useStartProjectForm() {
  const [values, setValues] = useState<ProjectEnquiryFormValues>(EMPTY_FORM_VALUES);
  const [currentStep, setCurrentStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  useEffect(() => {
    // Syncing from the URL query string (an external system) once on mount — the
    // sanctioned effect pattern per react-hooks/set-state-in-effect's own guidance.
    if (typeof window === "undefined") return;
    const preselected = new URLSearchParams(window.location.search).get("service");
    if (preselected && VALID_SERVICE_TYPES.includes(preselected as ServiceTypeOption)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues((v) => ({ ...v, serviceType: preselected as ServiceTypeOption }));
    }
  }, []);

  const setField = useCallback(<K extends keyof ProjectEnquiryFormValues>(field: K, value: ProjectEnquiryFormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setFieldErrors((errs) => {
      if (!(field in errs)) return errs;
      const next = { ...errs };
      delete next[field];
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    const errors = validateStep(currentStep, values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  }, [currentStep, values]);

  const goBack = useCallback(() => {
    setFieldErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const submit = useCallback(async () => {
    if (values.website.trim() !== "") {
      return;
    }
    const errors = validateStep(3, values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmission({ status: "submitting" });
    const result = await submitProjectEnquiry(values);
    setSubmission(result);

    if (result.status === "error" && result.kind === "VALIDATION" && result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      const firstField = Object.keys(result.fieldErrors)[0] as keyof ProjectEnquiryFormValues | undefined;
      if (firstField) {
        setCurrentStep(FIELD_TO_STEP[firstField]);
      }
    }
  }, [values]);

  const reset = useCallback(() => {
    setValues(EMPTY_FORM_VALUES);
    setCurrentStep(0);
    setFieldErrors({});
    setSubmission({ status: "idle" });
  }, []);

  return { values, currentStep, fieldErrors, submission, setField, goNext, goBack, submit, reset };
}
