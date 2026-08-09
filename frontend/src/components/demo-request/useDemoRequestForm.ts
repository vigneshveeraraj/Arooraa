import { useCallback, useState } from "react";
import { submitDemoRequest } from "./api";
import { EMPTY_FORM_VALUES, type DemoRequestFormValues, type SubmissionState } from "./types";
import { validateDemoRequestForm } from "./validation";

export function useDemoRequestForm() {
  const [values, setValues] = useState<DemoRequestFormValues>(EMPTY_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  const setField = useCallback(
    (field: keyof DemoRequestFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(EMPTY_FORM_VALUES);
    setFieldErrors({});
    setSubmission({ status: "idle" });
  }, []);

  const submit = useCallback(async () => {
    if (submission.status === "submitting") return;

    if (values.website.trim()) {
      // Honeypot populated: a real user never fills this in. Fail silently
      // and generically, matching the backend's own honeypot rejection —
      // no need to tell an automated submitter what tripped it.
      setSubmission({
        status: "error",
        kind: "VALIDATION",
        message: "Please correct the highlighted fields.",
      });
      return;
    }

    const errors = validateDemoRequestForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmission({
        status: "error",
        kind: "VALIDATION",
        message: "Please correct the highlighted fields.",
      });
      return;
    }

    setSubmission({ status: "submitting" });
    const result = await submitDemoRequest(values);
    setSubmission(result);
    if (result.status === "error" && result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }
  }, [values, submission.status]);

  return { values, fieldErrors, submission, setField, submit, reset };
}
