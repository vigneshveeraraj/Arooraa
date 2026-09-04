"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  createAuraBriefApiClient,
  type AuraBrief,
  type AuraBriefApiClient,
  type AuraHandoffContact,
} from "./brief-client";

/**
 * The project brief as the panel sees it: whether to offer a summary, what the summary says, and
 * how far through sending it the visitor has got.
 *
 * <p>The steps are a small state machine rather than a set of booleans, because the order is the
 * safety property. A visitor moves summary → consent → contact → sent, and cannot skip a step:
 * consent is asked as its own question before any details are collected, so filling a form in is
 * never mistaken for saying yes. The backend enforces the same thing independently — see
 * ProjectDiscoveryService — and neither side trusts the other to have done it.
 */
export type AuraBriefStep = "IDLE" | "SUMMARY" | "CONSENT" | "CONTACT" | "SENT";

export interface AuraBriefController {
  /** Offer the summary at all. False for every conversation that is not about a project. */
  offerSummary: boolean;
  step: AuraBriefStep;
  brief: AuraBrief | null;
  busy: boolean;
  /** Visitor-facing, already safe to render. */
  error: string | null;
  /** Which contact field the backend objected to, when it named one. */
  errorField: string | null;
  enquiryReference: string | null;

  /** Called after each answer, with the conversation and how many things the visitor has said. */
  refresh(conversationId: string, visitorTurns: number): void;
  summarise(conversationId: string): void;
  /** "Looks right" — moves to the consent question, and sends nothing. */
  acceptSummary(): void;
  /** "Change something" — back to the conversation; saying what is wrong is the correction. */
  reviseSummary(): void;
  /** The consent question answered yes. Still sends nothing: details come next. */
  giveConsent(): void;
  send(conversationId: string, contact: AuraHandoffContact): void;
  dismiss(): void;
  /**
   * Forgets this conversation's brief entirely — the summary, the step, the error and the enquiry
   * reference (A5.2.2). Part of the one reset a new conversation performs, see AuraPanel.
   *
   * <p>Distinct from {@link dismiss}, which puts a visitor back into the conversation they are
   * still having. A brief describes a particular conversation, so once that conversation is over
   * the summary of it is not merely hidden, it no longer applies to anything on screen.
   */
  reset(): void;
}

/** Below this there is nothing worth asking the backend about, so it is not asked. */
const MIN_VISITOR_TURNS = 3;

export interface UseAuraBriefOptions {
  /** Injected by tests; production always uses the real client. */
  client?: AuraBriefApiClient;
}

export function useAuraBrief({ client }: UseAuraBriefOptions = {}): AuraBriefController {
  const api = useMemo(() => client ?? createAuraBriefApiClient(), [client]);

  const [brief, setBrief] = useState<AuraBrief | null>(null);
  const [step, setStep] = useState<AuraBriefStep>("IDLE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [enquiryReference, setEnquiryReference] = useState<string | null>(null);

  /**
   * Which conversation this brief belongs to, counting resets. Every request here resumes after an
   * await, and a summary of a conversation the visitor has left must not appear under the empty one
   * that replaced it.
   */
  const epoch = useRef(0);

  const refresh = useCallback(
    (conversationId: string, visitorTurns: number) => {
      // Gated locally so an ordinary two-turn conversation costs no request at all. Past that the
      // backend decides, from the modes the pipeline itself recorded.
      if (visitorTurns < MIN_VISITOR_TURNS) return;
      const turn = epoch.current;
      void api.peek(conversationId).then((result) => {
        if (epoch.current !== turn) return;
        if (result.ok) setBrief(result.value);
      });
    },
    [api],
  );

  const summarise = useCallback(
    (conversationId: string) => {
      const turn = epoch.current;
      setBusy(true);
      setError(null);
      void api
        .summarise(conversationId)
        .then((result) => {
          if (epoch.current !== turn) return;
          if (!result.ok) {
            setError(result.message);
            return;
          }
          setBrief(result.value);
          // Only shown when the backend agrees there is something worth showing; otherwise the
          // visitor is told to say a little more, which is the honest answer.
          if (result.value.status === "DRAFT") {
            setError("Tell me a little more first, and I'll put a summary together.");
            return;
          }
          setStep("SUMMARY");
        })
        .finally(() => {
          // The reset already cleared this; setting it again would clear it on behalf of a request
          // belonging to a conversation that no longer exists.
          if (epoch.current !== turn) return;
          setBusy(false);
        });
    },
    [api],
  );

  const send = useCallback(
    (conversationId: string, contact: AuraHandoffContact) => {
      const turn = epoch.current;
      setBusy(true);
      setError(null);
      setErrorField(null);
      void api
        .handOff(conversationId, contact)
        .then((result) => {
          if (epoch.current !== turn) return;
          if (!result.ok) {
            setError(result.message);
            setErrorField(result.field ?? null);
            return;
          }
          setEnquiryReference(result.value.enquiryReference);
          setStep("SENT");
        })
        .finally(() => {
          if (epoch.current !== turn) return;
          setBusy(false);
        });
    },
    [api],
  );

  return {
    offerSummary: brief?.readyToSummarise === true && step === "IDLE" && brief.status !== "SUBMITTED",
    step,
    brief,
    busy,
    error,
    errorField,
    enquiryReference,
    refresh,
    summarise,
    acceptSummary: useCallback(() => setStep("CONSENT"), []),
    reviseSummary: useCallback(() => setStep("IDLE"), []),
    giveConsent: useCallback(() => setStep("CONTACT"), []),
    send,
    dismiss: useCallback(() => {
      setStep("IDLE");
      setError(null);
      setErrorField(null);
    }, []),
    reset: useCallback(() => {
      epoch.current += 1;
      setBrief(null);
      setStep("IDLE");
      setBusy(false);
      setError(null);
      setErrorField(null);
      setEnquiryReference(null);
    }, []),
  };
}
