import {
  CONTACT_METHOD_HEADING,
  CONTACT_METHOD_OPTIONS,
  CONTACT_TIME_HEADING,
  CONTACT_TIME_OPTIONS,
  ROLE_EXAMPLES,
  TRUST_PRIVACY_NOTE,
  TRUST_SENSITIVE_DATA_NOTE,
  WHATSAPP_CONSENT_TEXT,
} from "@/lib/content/start-project";
import type { FormFieldErrors, StartProjectFormValues } from "@/lib/start-project/types";
import { describedBy, FormField } from "./shared/FormField";
import { ChipOption } from "./shared/ChipOption";
import { PhoneCountryField } from "./PhoneCountryField";
import styles from "./StepContact.module.css";

interface StepContactProps {
  values: StartProjectFormValues;
  errors: FormFieldErrors;
  setField: <K extends keyof StartProjectFormValues>(field: K, value: StartProjectFormValues[K]) => void;
}

/** Step 3 — How can we reach you? (W3.2A §16–20). */
export function StepContact({ values, errors, setField }: StepContactProps) {
  return (
    <div className={styles.content}>
      <div className={styles.nameEmailRow}>
        <FormField label="Full name" htmlFor="name" required error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name", { error: !!errors.name })}
          />
        </FormField>

        <FormField label="Email address" htmlFor="email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email", { error: !!errors.email })}
          />
        </FormField>
      </div>

      <PhoneCountryField
        country={values.country}
        phone={values.phone}
        countryError={errors.country}
        phoneError={errors.phone}
        onCountryChange={(v) => setField("country", v)}
        onPhoneChange={(v) => setField("phone", v)}
      />

      <div className={styles.companyRow}>
        <FormField label="Company / Organization" htmlFor="company">
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => setField("company", e.target.value)}
          />
        </FormField>

        <FormField label="Role / Responsibility" htmlFor="role">
          <input
            id="role"
            name="role"
            type="text"
            list="start-project-role-examples"
            value={values.role}
            onChange={(e) => setField("role", e.target.value)}
          />
          <datalist id="start-project-role-examples">
            {ROLE_EXAMPLES.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>
        </FormField>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{CONTACT_METHOD_HEADING}</legend>
        <div className={styles.chipRow}>
          {CONTACT_METHOD_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              name="preferredContactMethod"
              value={option.value}
              checked={values.preferredContactMethod === option.value}
              onChange={(v) => setField("preferredContactMethod", v as StartProjectFormValues["preferredContactMethod"])}
              label={option.label}
            />
          ))}
        </div>
        {errors.preferredContactMethod ? (
          <p role="alert" tabIndex={-1} className={styles.error}>
            {errors.preferredContactMethod}
          </p>
        ) : null}
      </fieldset>

      {values.preferredContactMethod === "WHATSAPP" ? (
        <div className={styles.consent}>
          <label className={styles.consentLabel} htmlFor="whatsappConsent">
            <input
              id="whatsappConsent"
              name="whatsappConsent"
              type="checkbox"
              checked={values.whatsappConsent}
              onChange={(e) => setField("whatsappConsent", e.target.checked)}
              aria-invalid={!!errors.whatsappConsent}
              aria-describedby={describedBy("whatsappConsent", { error: !!errors.whatsappConsent })}
            />
            <span>{WHATSAPP_CONSENT_TEXT}</span>
          </label>
          {errors.whatsappConsent ? (
            <p id="whatsappConsent-error" role="alert" tabIndex={-1} className={styles.error}>
              {errors.whatsappConsent}
            </p>
          ) : null}
        </div>
      ) : null}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{CONTACT_TIME_HEADING}</legend>
        <div className={styles.chipRow}>
          {CONTACT_TIME_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              name="preferredContactTime"
              value={option.value}
              checked={values.preferredContactTime === option.value}
              onChange={(v) => setField("preferredContactTime", v as StartProjectFormValues["preferredContactTime"])}
              label={option.label}
            />
          ))}
        </div>
      </fieldset>

      <div className={styles.trust}>
        <p className="text-body-sm">{TRUST_PRIVACY_NOTE}</p>
        <p className="text-body-sm">{TRUST_SENSITIVE_DATA_NOTE}</p>
      </div>

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
    </div>
  );
}
