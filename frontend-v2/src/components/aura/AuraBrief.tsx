"use client";

import { useEffect, useRef, useState } from "react";
import type { AuraBriefController } from "@/lib/aura/brief/useAuraBrief";
import type { AuraBriefFields, AuraHandoffContact } from "@/lib/aura/brief/brief-client";
import styles from "./AuraBrief.module.css";

/**
 * What Aura understood, and what happens next.
 *
 * <p>Three screens in one card, in a fixed order: the summary, the consent question, and the
 * contact details. The order is the design. Consent is asked on its own, in plain words, with two
 * buttons and nothing else on screen — so it cannot be answered by accident, and filling in a form
 * afterwards is not what said yes.
 *
 * <p>The summary shows only what Aura actually knows. A field it does not have is simply not there,
 * and the things it noticed it does not know are shown as their own line — which is the most useful
 * part of a brief and the opposite of a gap.
 */
interface AuraBriefProps {
  controller: AuraBriefController;
  conversationId: string | null;
}

const CONTACT_METHODS: { value: AuraHandoffContact["preferredContactMethod"]; label: string }[] = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "VIDEO_CALL", label: "Video call" },
];

export function AuraBrief({ controller, conversationId }: AuraBriefProps) {
  const cardRef = useRef<HTMLElement>(null);

  // Focus moves to each step as it appears. The card lives inside the conversation log, which is a
  // polite live region — so without this a screen-reader user would have the whole summary, and
  // then a whole form, read at them while their focus stayed in the composer behind it. Moving
  // focus is the right response to a screen change the visitor asked for, and it is why the card
  // opts out of the live region below rather than being announced twice.
  useEffect(() => {
    if (controller.step !== "IDLE") cardRef.current?.focus({ preventScroll: true });
  }, [controller.step]);

  if (controller.step === "IDLE" || !conversationId) return null;

  return (
    <section
      ref={cardRef}
      className={styles.brief}
      aria-label="Your project so far"
      aria-live="off"
      tabIndex={-1}
    >
      {controller.step === "SUMMARY" ? <Summary controller={controller} /> : null}
      {controller.step === "CONSENT" ? <Consent controller={controller} /> : null}
      {controller.step === "CONTACT" ? (
        <Contact controller={controller} conversationId={conversationId} />
      ) : null}
      {controller.step === "SENT" ? <Sent controller={controller} /> : null}
    </section>
  );
}

function Summary({ controller }: { controller: AuraBriefController }) {
  const fields = controller.brief?.fields ?? {};

  return (
    <>
      <h2 className={styles.heading}>Here&rsquo;s what I understood</h2>
      <dl className={styles.fields}>
        <Line label="The problem" value={fields.problemStatement} />
        <Line label="Who it&rsquo;s for" value={fields.targetUsers} />
        <Line label="How it works today" value={fields.currentSituation} />
        <Line label="What you want instead" value={fields.desiredOutcome} />
        <ListLine label="Capabilities" values={fields.proposedCapabilities} />
        <ListLine label="Platforms" values={fields.platforms} />
        <ListLine label="Integrations" values={fields.integrations} />
        <Line label="AI or automation" value={fields.aiAutomationNeeds} />
        <Line label="Existing systems" value={fields.existingSystems} />
        <Line label="Constraints" value={fields.constraints} />
        <Line label="Timeline" value={fields.timeline} />
      </dl>

      {fields.unknowns && fields.unknowns.length > 0 ? (
        <p className={styles.unknowns}>
          <span className={styles.unknownsLabel}>Still to work out</span>
          {fields.unknowns.join(" · ")}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={controller.acceptSummary}>
          That&rsquo;s right
        </button>
        <button type="button" className={styles.secondary} onClick={controller.reviseSummary}>
          Change something
        </button>
        <button type="button" className={styles.secondary} onClick={controller.dismiss}>
          Keep talking
        </button>
      </div>
    </>
  );
}

function Consent({ controller }: { controller: AuraBriefController }) {
  if (!controller.brief?.handoffAvailable) {
    return (
      <>
        <h2 className={styles.heading}>I can&rsquo;t send this from here</h2>
        <p className={styles.body}>
          I can&rsquo;t pass this to the team myself just yet — the Start a Project page is the way
          through, and everything above is yours to copy across.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={controller.dismiss}>
            Close
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* The question, on its own, in the words a person would use. Nothing else is on screen with
          it: this is the moment the visitor decides, and it should not share the page with a form. */}
      <h2 className={styles.heading}>
        Would you like me to send this to the AROORAA team as a project enquiry?
      </h2>
      <p className={styles.body}>
        They&rsquo;ll read exactly what you just saw. I&rsquo;ll need a few details so they can
        reply.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={controller.giveConsent}>
          Yes, send it
        </button>
        <button type="button" className={styles.secondary} onClick={controller.dismiss}>
          Not now
        </button>
      </div>
    </>
  );
}

function Contact({
  controller,
  conversationId,
}: {
  controller: AuraBriefController;
  conversationId: string;
}) {
  const [values, setValues] = useState<AuraHandoffContact>({
    name: "",
    businessEmail: "",
    phone: "",
    country: "",
    preferredContactMethod: "EMAIL",
  });

  function set<K extends keyof AuraHandoffContact>(key: K, value: AuraHandoffContact[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const complete =
    values.name.trim().length > 0 &&
    values.businessEmail.trim().length > 0 &&
    values.phone.trim().length > 0 &&
    values.country.trim().length > 0;

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (complete && !controller.busy) controller.send(conversationId, values);
      }}
    >
      <h2 className={styles.heading}>How should they reach you?</h2>
      {/* Exactly what the Start Project workflow genuinely requires, and nothing else. No budget,
          no company size, no role — none of which anybody needs in order to reply to you. */}
      <Field
        id="aura-contact-name"
        label="Your name"
        value={values.name}
        onChange={(value) => set("name", value)}
        invalid={controller.errorField === "name"}
        autoComplete="name"
      />
      <Field
        id="aura-contact-email"
        label="Email address"
        type="email"
        value={values.businessEmail}
        onChange={(value) => set("businessEmail", value)}
        invalid={controller.errorField === "businessEmail"}
        autoComplete="email"
      />
      <Field
        id="aura-contact-phone"
        label="Phone number"
        type="tel"
        value={values.phone}
        onChange={(value) => set("phone", value)}
        invalid={controller.errorField === "phone"}
        autoComplete="tel"
      />
      <Field
        id="aura-contact-country"
        label="Country"
        value={values.country}
        onChange={(value) => set("country", value)}
        invalid={controller.errorField === "country"}
        autoComplete="country-name"
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Best way to reach you</legend>
        <div className={styles.choices}>
          {CONTACT_METHODS.map((method) => (
            <label key={method.value} className={styles.choice}>
              <input
                type="radio"
                name="aura-contact-method"
                value={method.value}
                checked={values.preferredContactMethod === method.value}
                onChange={() => set("preferredContactMethod", method.value)}
              />
              {method.label}
            </label>
          ))}
        </div>
      </fieldset>

      {controller.error ? (
        <p className={styles.error} role="alert">
          {controller.error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={!complete || controller.busy}>
          {controller.busy ? "Sending…" : "Send to the team"}
        </button>
        <button type="button" className={styles.secondary} onClick={controller.dismiss}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Sent({ controller }: { controller: AuraBriefController }) {
  return (
    <>
      <h2 className={styles.heading}>That&rsquo;s with the team</h2>
      <p className={styles.body}>
        Your reference is <strong>{controller.enquiryReference}</strong> — worth keeping if you
        write to us. Someone will read it properly and come back to you.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={controller.dismiss}>
          Close
        </button>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{value}</dd>
    </div>
  );
}

function ListLine({ label, values }: { label: string; values?: string[] }) {
  if (!values || values.length === 0) return null;
  return <Line label={label} value={values.join(", ")} />;
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  invalid,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  invalid?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
