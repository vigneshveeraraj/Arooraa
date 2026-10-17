"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { LEAD_CAPTURE_ENABLED, realLeadCaptureAdapter } from "@/lib/lead-capture/adapter";
import { LEAD_COPY } from "@/lib/lead-capture/copy";
import { normalizeIndianMobile } from "@/lib/lead-capture/phone";
import {
  LEAD_REQUIREMENTS,
  type LeadAttribution,
  type LeadCaptureAdapter,
  type LeadCaptureResult,
  type LeadLocale,
  type LeadRequirement,
} from "@/lib/lead-capture/types";
import { leadWhatsAppUrl } from "@/lib/lead-capture/whatsapp";
import { CAMPAIGN_CONTACT } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import styles from "./CampaignLeadForm.module.css";

type Field = "requirement" | "phone" | "consent";
type Errors = Partial<Record<Field, string>>;
type Status =
  | { kind: "editing" }
  | { kind: "submitting" }
  | { kind: "failed"; reason: Extract<LeadCaptureResult, { ok: false }>["reason"] }
  | { kind: "saved"; leadReference?: string };

function captureAttribution(): LeadAttribution {
  const params = new URLSearchParams(window.location.search);
  const param = (name: string) => params.get(name)?.slice(0, 200) || undefined;
  return {
    sourcePage: window.location.pathname,
    referrer: document.referrer.slice(0, 1000) || undefined,
    utmSource: param("utm_source"),
    utmMedium: param("utm_medium"),
    utmCampaign: param("utm_campaign"),
    utmContent: param("utm_content"),
  };
}

/**
 * The low-friction consultation form: pick a requirement, then (and only then) the mobile
 * number and consent appear. The lead is saved on the server before WhatsApp is offered with
 * the saved reference; if saving fails, the visitor is told plainly that nothing was saved and
 * can still reach the team directly.
 *
 * When lead capture is not connected (`enabled` false), the phone step is never shown — there
 * is no point asking for a number that cannot be stored — and the visitor goes straight to
 * WhatsApp or a call.
 */
export function CampaignLeadForm({
  locale,
  adapter = realLeadCaptureAdapter,
  enabled = LEAD_CAPTURE_ENABLED,
}: {
  locale: LeadLocale;
  adapter?: LeadCaptureAdapter;
  enabled?: boolean;
}) {
  const copy = LEAD_COPY[locale];
  const id = useId();
  const [requirement, setRequirement] = useState<LeadRequirement | "">("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "editing" });

  // One key per intended lead: a retry of the same details replays safely, while any edit gets
  // a fresh key so the server never sees one key with two different payloads.
  const idempotencyKey = useRef<string | null>(null);
  const requirementRef = useRef<HTMLFieldSetElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  function validate(values: { requirement: string; phone: string; consent: boolean }): Errors {
    const next: Errors = {};
    if (!values.requirement) next.requirement = copy.errors.requirement;
    if (enabled && !normalizeIndianMobile(values.phone)) next.phone = copy.errors.phone;
    if (enabled && !values.consent) next.consent = copy.errors.consent;
    return next;
  }

  function edit(change: Partial<{ requirement: LeadRequirement; phone: string; consent: boolean }>) {
    const values = { requirement, phone, consent, ...change };
    if (change.requirement !== undefined) setRequirement(change.requirement);
    if (change.phone !== undefined) setPhone(change.phone);
    if (change.consent !== undefined) setConsent(change.consent);
    idempotencyKey.current = null;
    if (attempted) setErrors(validate(values));
    if (status.kind === "failed") setStatus({ kind: "editing" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "submitting") return;
    setAttempted(true);
    const found = validate({ requirement, phone, consent });
    setErrors(found);
    if (found.requirement) return requirementRef.current?.querySelector("input")?.focus();
    if (found.phone) return phoneRef.current?.focus();
    if (found.consent) return consentRef.current?.focus();

    const normalized = normalizeIndianMobile(phone);
    if (!requirement || !normalized) return;
    // A filled honeypot is a bot: behave as if nothing happened, and send nothing.
    if (website) return;

    idempotencyKey.current ??= crypto.randomUUID();
    setStatus({ kind: "submitting" });
    const result = await adapter.submit(
      {
        requirement,
        phone: normalized,
        consent: true,
        consentText: copy.consentLabel.replaceAll("⁠", ""),
        sourceLocale: locale,
        attribution: captureAttribution(),
      },
      idempotencyKey.current,
    );
    if (result.ok) {
      idempotencyKey.current = null;
      setStatus({ kind: "saved", leadReference: result.leadReference });
      requestAnimationFrame(() => successRef.current?.focus());
    } else {
      setStatus({ kind: "failed", reason: result.reason });
    }
  }

  const callLink = (
    <a className={styles.call} href={`tel:${CAMPAIGN_CONTACT.phoneE164}`}>
      <CampaignIcon name="phone" className={styles.icon} />
      {copy.fallbackCall} {CAMPAIGN_CONTACT.phoneDisplay}
    </a>
  );

  if (status.kind === "saved") {
    return (
      <div className={styles.card} lang={locale}>
        <h3 ref={successRef} tabIndex={-1} className={styles.title}>
          {copy.success.title}
        </h3>
        {status.leadReference && (
          <p className={styles.reference}>
            {copy.success.reference}: <strong lang="en">{status.leadReference}</strong>
          </p>
        )}
        <p className={styles.intro}>{copy.success.body}</p>
        <a
          className={styles.whatsapp}
          href={leadWhatsAppUrl({ locale, requirement: requirement || undefined, leadReference: status.leadReference })}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CampaignIcon name="whatsapp" className={styles.icon} />
          {copy.success.continueWhatsApp}
        </a>
        <p className={styles.hint}>{copy.success.sendNote}</p>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const describe = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

  return (
    <form className={styles.card} lang={locale} noValidate aria-busy={submitting} onSubmit={onSubmit}>
      <h3 className={styles.title}>{copy.title}</h3>
      <p className={styles.intro}>{enabled ? copy.intro : copy.introDirect}</p>

      <fieldset
        ref={requirementRef}
        className={styles.fieldset}
        aria-describedby={describe(errors.requirement && `${id}-requirement-error`)}
        disabled={submitting}
      >
        <legend className={styles.legend}>{copy.requirementLegend}</legend>
        <div className={styles.options}>
          {LEAD_REQUIREMENTS.map((value) => (
            <label key={value} className={styles.option}>
              <input
                type="radio"
                name={`${id}-requirement`}
                value={value}
                checked={requirement === value}
                onChange={() => edit({ requirement: value })}
              />
              <span>{copy.requirements[value]}</span>
            </label>
          ))}
        </div>
        {errors.requirement && (
          <p id={`${id}-requirement-error`} className={styles.error}>
            {errors.requirement}
          </p>
        )}
      </fieldset>

      {requirement && !enabled && (
        <div className={styles.fallback}>
          <p>{copy.unavailableNotice}</p>
          <a className={styles.whatsapp} href={leadWhatsAppUrl({ locale, requirement })} target="_blank" rel="noopener noreferrer">
            <CampaignIcon name="whatsapp" className={styles.icon} />
            {copy.fallbackWhatsApp}
          </a>
          {callLink}
        </div>
      )}

      {requirement && enabled && (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${id}-phone`}>
              {copy.phoneLabel}
            </label>
            <p id={`${id}-phone-hint`} className={styles.hint}>
              {copy.phoneHint}
            </p>
            <div className={styles.phoneRow}>
              <span className={styles.prefix} aria-hidden="true">
                +91
              </span>
              <input
                ref={phoneRef}
                id={`${id}-phone`}
                className={styles.input}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={16}
                value={phone}
                disabled={submitting}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={describe(`${id}-phone-hint`, errors.phone && `${id}-phone-error`)}
                onChange={(event) => edit({ phone: event.target.value })}
              />
            </div>
            {errors.phone && (
              <p id={`${id}-phone-error`} className={styles.error}>
                {errors.phone}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.consent}>
              <input
                ref={consentRef}
                type="checkbox"
                checked={consent}
                disabled={submitting}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={describe(errors.consent && `${id}-consent-error`)}
                onChange={(event) => edit({ consent: event.target.checked })}
              />
              <span>{copy.consentLabel}</span>
            </label>
            {errors.consent && (
              <p id={`${id}-consent-error`} className={styles.error}>
                {errors.consent}
              </p>
            )}
          </div>

          <div className={styles.honeypot} aria-hidden="true">
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>
          </div>

          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting ? copy.submitting : copy.submit}
          </button>
          <p className={styles.srOnly} role="status">
            {submitting ? copy.submitting : ""}
          </p>

          {status.kind === "failed" && (
            <div className={styles.fallback} role="alert">
              <p>
                <strong>{copy.failure[status.reason]}</strong> {copy.notSaved}
              </p>
              <a className={styles.whatsapp} href={leadWhatsAppUrl({ locale, requirement })} target="_blank" rel="noopener noreferrer">
                <CampaignIcon name="whatsapp" className={styles.icon} />
                {copy.fallbackWhatsApp}
              </a>
              {callLink}
            </div>
          )}
        </>
      )}
    </form>
  );
}
