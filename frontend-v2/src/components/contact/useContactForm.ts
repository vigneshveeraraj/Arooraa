"use client";

import { useCallback, useRef, useState } from "react";
import { realContactAdapter, type ContactAdapter } from "@/lib/contact/adapter";
import {
  EMPTY_CONTACT_FORM_VALUES,
  type ContactFieldErrors,
  type ContactFormValues,
  type ContactSubmissionState,
} from "@/lib/contact/types";
import { validateContactForm } from "@/lib/contact/validation";

/**
 * Contact form state (W3.4 §16). Accepts an adapter override so tests can inject a fake adapter
 * without a network call — the live page always uses the real one. The idempotency key is
 * generated once per mount and reused across retries of the same submission, so a network-
 * failure retry replays safely instead of risking a duplicate message.
 */
export function useContactForm(adapter: ContactAdapter = realContactAdapter) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [submission, setSubmission] = useState<ContactSubmissionState>({ status: "idle" });
  const idempotencyKeyRef = useRef<string>(typeof crypto !== "undefined" ? crypto.randomUUID() : "");

  const setField = useCallback(<K extends keyof ContactFormValues>(field: K, value: ContactFormValues[K]) => {
    setValues((v) => {
      const next = { ...v, [field]: value };
      // Changing the reason away from PRODUCT_QUESTION clears a previously chosen product —
      // the field is only ever meaningful for that one reason (W3.4 §8).
      if (field === "reason" && value !== "PRODUCT_QUESTION") {
        next.product = "";
      }
      return next;
    });
    setErrors((errs) => {
      if (!(field in errs)) return errs;
      const next = { ...errs };
      delete next[field];
      return next;
    });
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validateContactForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmission({ status: "submitting" });

    const result = await adapter.submit(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        company: values.company.trim() || undefined,
        reason: values.reason as Exclude<ContactFormValues["reason"], "">,
        product: values.product ? values.product : undefined,
        message: values.message.trim(),
      },
      idempotencyKeyRef.current,
    );

    setSubmission(
      result.ok
        ? { status: "success", result: { contactReference: result.contactReference, message: result.message } }
        : { status: "error", message: result.message },
    );
  }, [values, adapter]);

  const reset = useCallback(() => {
    setValues(EMPTY_CONTACT_FORM_VALUES);
    setErrors({});
    setSubmission({ status: "idle" });
    idempotencyKeyRef.current = typeof crypto !== "undefined" ? crypto.randomUUID() : "";
  }, []);

  return { values, errors, submission, setField, submit, reset };
}
