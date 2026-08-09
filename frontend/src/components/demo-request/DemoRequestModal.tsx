"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useDemoModal } from "./DemoModalContext";
import { useDemoRequestForm } from "./useDemoRequestForm";
import { CONTACT_METHOD_OPTIONS, INTERESTED_PRODUCT_OPTIONS, OUTLET_COUNT_OPTIONS } from "./options";
import styles from "./DemoRequestModal.module.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DemoRequestModal() {
  const { isOpen, close } = useDemoModal();
  const { values, fieldErrors, submission, setField, submit, reset } = useDemoRequestForm();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const isSubmitting = submission.status === "submitting";

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    close();
  }, [isSubmitting, close]);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      firstFieldRef.current?.focus();
      return () => {
        document.body.style.overflow = "";
      };
    }
    reset();
    previouslyFocused.current?.focus();
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }
      if (event.key !== "Tab") return;

      const container = dialogRef.current;
      if (!container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const isSuccess = submission.status === "success";

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="demo-modal-title" ref={dialogRef}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close dialog"
          disabled={isSubmitting}
        >
          ✕
        </button>

        {isSuccess ? (
          <div className={styles.successPanel}>
            <h2 id="demo-modal-title" className={styles.title}>
              {submission.kind === "RECEIVED" ? "Request received" : "Already on it"}
            </h2>
            <p className={styles.successMessage}>{submission.message}</p>
            <button type="button" className="btn btnPrimary" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 id="demo-modal-title" className={styles.title}>
              Book a Personalised Demo
            </h2>
            <p className={styles.subtitle}>
              Tell us about your restaurant and we&apos;ll set up a guided MESA walkthrough.
            </p>

            {submission.status === "error" && (
              <div className={styles.formError} role="alert">
                {submission.message}
              </div>
            )}

            <div className={styles.fieldGrid}>
              <Field label="Full name" htmlFor="fullName" error={fieldErrors.fullName}>
                <input
                  ref={firstFieldRef}
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={values.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  aria-invalid={!!fieldErrors.fullName}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="WhatsApp number" htmlFor="whatsappNumber" error={fieldErrors.whatsappNumber}>
                <input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  value={values.whatsappNumber}
                  onChange={(e) => setField("whatsappNumber", e.target.value)}
                  aria-invalid={!!fieldErrors.whatsappNumber}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Business email" htmlFor="businessEmail" error={fieldErrors.businessEmail}>
                <input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  autoComplete="email"
                  value={values.businessEmail}
                  onChange={(e) => setField("businessEmail", e.target.value)}
                  aria-invalid={!!fieldErrors.businessEmail}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Restaurant name" htmlFor="restaurantName" error={fieldErrors.restaurantName}>
                <input
                  id="restaurantName"
                  name="restaurantName"
                  type="text"
                  value={values.restaurantName}
                  onChange={(e) => setField("restaurantName", e.target.value)}
                  aria-invalid={!!fieldErrors.restaurantName}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="City" htmlFor="city" error={fieldErrors.city}>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={values.city}
                  onChange={(e) => setField("city", e.target.value)}
                  aria-invalid={!!fieldErrors.city}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Number of outlets" htmlFor="outletCount" error={fieldErrors.outletCount}>
                <select
                  id="outletCount"
                  name="outletCount"
                  value={values.outletCount}
                  onChange={(e) => setField("outletCount", e.target.value)}
                  aria-invalid={!!fieldErrors.outletCount}
                  disabled={isSubmitting}
                >
                  <option value="">Select…</option>
                  {OUTLET_COUNT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="I'm interested in" htmlFor="interestedProduct" error={fieldErrors.interestedProduct}>
                <select
                  id="interestedProduct"
                  name="interestedProduct"
                  value={values.interestedProduct}
                  onChange={(e) => setField("interestedProduct", e.target.value)}
                  aria-invalid={!!fieldErrors.interestedProduct}
                  disabled={isSubmitting}
                >
                  <option value="">Select…</option>
                  {INTERESTED_PRODUCT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Preferred contact method"
                htmlFor="preferredContactMethod"
                error={fieldErrors.preferredContactMethod}
              >
                <select
                  id="preferredContactMethod"
                  name="preferredContactMethod"
                  value={values.preferredContactMethod}
                  onChange={(e) => setField("preferredContactMethod", e.target.value)}
                  aria-invalid={!!fieldErrors.preferredContactMethod}
                  disabled={isSubmitting}
                >
                  <option value="">Select…</option>
                  {CONTACT_METHOD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Message (optional)" htmlFor="message" error={fieldErrors.message}>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={values.message}
                onChange={(e) => setField("message", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(e) => setField("website", e.target.value)}
              />
            </div>

            <button type="submit" className={`btn btnPrimary ${styles.submitBtn}`} disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Book a Demo"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && (
        <span className={styles.fieldError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
