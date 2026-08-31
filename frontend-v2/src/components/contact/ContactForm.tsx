"use client";

import { describedBy, FormField } from "@/components/start-project/shared/FormField";
import { Button } from "@/components/ui/Button";
import type { ContactAdapter } from "@/lib/contact/adapter";
import { CONTACT_FORM_CONTENT, CONTACT_SUCCESS_CONTENT } from "@/lib/content/contact";
import { CONTACT_PRODUCT_OPTIONS, CONTACT_REASON_OPTIONS, MESSAGE_MAX_LENGTH } from "@/lib/contact/types";
import { useContactForm } from "./useContactForm";
import styles from "./ContactForm.module.css";

interface ContactFormProps {
  /** Test-only override — the live page always gets the real backend-connected adapter. */
  adapter?: ContactAdapter;
}

/**
 * The Contact form itself (W3.4 §4, §16): name/email/reason/message required, phone/company
 * optional, product only shown once "Product question" is selected. Values are preserved
 * across a recoverable error (only success clears them); the submit button disables while
 * submitting to prevent a double submit.
 */
export function ContactForm({ adapter }: ContactFormProps) {
  const { values, errors, submission, setField, submit } = useContactForm(adapter);
  const { fields } = CONTACT_FORM_CONTENT;

  if (submission.status === "success") {
    const { result } = submission;
    return (
      <div className={styles.notice} role="status">
        <p className="text-h3">{CONTACT_SUCCESS_CONTENT.heading}</p>
        <p className={`text-body-sm ${styles.noticeBody}`}>{result.message}</p>
        {result.contactReference ? (
          <dl className={styles.successDetails}>
            <div>
              <dt>{CONTACT_SUCCESS_CONTENT.referenceLabel}</dt>
              <dd>{result.contactReference}</dd>
            </div>
          </dl>
        ) : null}
        <p className={`text-h4 ${styles.whatsNextTitle}`}>{CONTACT_SUCCESS_CONTENT.whatsNextTitle}</p>
        <p className={`text-body-sm ${styles.noticeBody}`}>{CONTACT_SUCCESS_CONTENT.whatsNextBody}</p>
        <div className={styles.successActions}>
          <Button href={CONTACT_SUCCESS_CONTENT.backHomeCta.href} variant="secondary">
            {CONTACT_SUCCESS_CONTENT.backHomeCta.label}
          </Button>
          <Button href={CONTACT_SUCCESS_CONTENT.startProjectCta.href}>{CONTACT_SUCCESS_CONTENT.startProjectCta.label}</Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      noValidate
    >
      {submission.status === "error" ? (
        <p role="alert" className={styles.formError}>
          {submission.message}
        </p>
      ) : null}

      <div className={styles.nameEmailRow}>
        <FormField label={fields.name} htmlFor="contact-name" required error={errors.name}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("contact-name", { error: !!errors.name })}
          />
        </FormField>

        <FormField label={fields.email} htmlFor="contact-email" required error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("contact-email", { error: !!errors.email })}
          />
        </FormField>
      </div>

      <div className={styles.nameEmailRow}>
        <FormField label={fields.phone} htmlFor="contact-phone" error={errors.phone}>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("contact-phone", { error: !!errors.phone })}
          />
        </FormField>

        <FormField label={fields.company} htmlFor="contact-company">
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => setField("company", e.target.value)}
          />
        </FormField>
      </div>

      <FormField label={fields.reason} htmlFor="contact-reason" required error={errors.reason}>
        <select
          id="contact-reason"
          name="reason"
          value={values.reason}
          onChange={(e) => setField("reason", e.target.value as typeof values.reason)}
          aria-invalid={!!errors.reason}
          aria-describedby={describedBy("contact-reason", { error: !!errors.reason })}
        >
          <option value="">{fields.reasonPlaceholder}</option>
          {CONTACT_REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      {values.reason === "PRODUCT_QUESTION" ? (
        <FormField label={fields.product} htmlFor="contact-product">
          <select
            id="contact-product"
            name="product"
            value={values.product}
            onChange={(e) => setField("product", e.target.value as typeof values.product)}
          >
            <option value="">{fields.productPlaceholder}</option>
            {CONTACT_PRODUCT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      <FormField label={fields.message} htmlFor="contact-message" required helper={fields.messageHelper} error={errors.message}>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX_LENGTH}
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("contact-message", { helper: true, error: !!errors.message })}
        />
      </FormField>

      <div className={styles.actions}>
        <Button type="submit" disabled={submission.status === "submitting"}>
          {submission.status === "submitting" ? CONTACT_FORM_CONTENT.submittingLabel : CONTACT_FORM_CONTENT.submitLabel}
        </Button>
      </div>
    </form>
  );
}
