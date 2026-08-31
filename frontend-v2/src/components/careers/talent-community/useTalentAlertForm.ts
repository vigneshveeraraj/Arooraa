"use client";

import { useCallback, useState } from "react";
import { realTalentAlertAdapter, type TalentAlertAdapter } from "@/lib/careers/alerts-adapter";
import {
  EMPTY_TALENT_ALERT_VALUES,
  type AreaOfInterest,
  type TalentAlertFieldErrors,
  type TalentAlertFormValues,
  type TalentAlertSubmissionState,
} from "@/lib/careers/alerts-types";
import { validateTalentAlertForm } from "@/lib/careers/alerts-validation";

/**
 * Talent-community form state (W3.3A §25–28, connected to the real backend in W3.3B §17).
 * Accepts an adapter override so tests can inject a successful/failing adapter without touching
 * network/timers — the live page always uses the real one.
 */
export function useTalentAlertForm(adapter: TalentAlertAdapter = realTalentAlertAdapter) {
  const [values, setValues] = useState<TalentAlertFormValues>(EMPTY_TALENT_ALERT_VALUES);
  const [errors, setErrors] = useState<TalentAlertFieldErrors>({});
  const [submission, setSubmission] = useState<TalentAlertSubmissionState>({ status: "idle" });

  const setField = useCallback(<K extends keyof TalentAlertFormValues>(field: K, value: TalentAlertFormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((errs) => {
      if (!(field in errs)) return errs;
      const next = { ...errs };
      delete next[field];
      return next;
    });
  }, []);

  const toggleAreaOfInterest = useCallback((area: AreaOfInterest) => {
    setValues((v) => ({
      ...v,
      areasOfInterest: v.areasOfInterest.includes(area)
        ? v.areasOfInterest.filter((a) => a !== area)
        : [...v.areasOfInterest, area],
    }));
    setErrors((errs) => {
      if (!("areasOfInterest" in errs)) return errs;
      const next = { ...errs };
      delete next.areasOfInterest;
      return next;
    });
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validateTalentAlertForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmission({ status: "submitting" });

    const result = await adapter.subscribe({
      name: values.name.trim(),
      email: values.email.trim(),
      areasOfInterest: values.areasOfInterest,
      experienceLevel: values.experienceLevel || undefined,
      consent: true,
    });

    setSubmission(result.ok ? { status: "success", message: result.message } : { status: "error", message: result.message });
  }, [values, adapter]);

  const reset = useCallback(() => {
    setValues(EMPTY_TALENT_ALERT_VALUES);
    setErrors({});
    setSubmission({ status: "idle" });
  }, []);

  return { values, errors, submission, setField, toggleAreaOfInterest, submit, reset };
}
