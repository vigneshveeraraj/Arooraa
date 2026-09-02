"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuraApiClient } from "./client";
import { createAuraApiClient } from "./client";
import { clearStoredConversationId, readStoredConversationId, storeConversationId } from "./session";
import { RESPONSE_READY_MS, type AuraState } from "./state";
import type { AuraFailure, AuraTranscriptMessage } from "./types";

let messageCounter = 0;
function nextId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

/**
 * How a message got here. Only ever used to decide whether Aura should read its answer out loud —
 * it changes nothing about how the message is classified, retrieved for, or answered, because a
 * spoken question and a typed one are the same question.
 */
export type AuraMessageSource = "TYPED" | "VOICE";

export interface UseAuraConversationOptions {
  client?: AuraApiClient;
  /** The pathname sent with every message. Context only — never authorization. */
  currentPath: string | null;
  /**
   * Fired once per answer, with the conversation it belongs to and how the question was asked.
   * A callback rather than something the caller observes with an effect, so voice playback starts
   * at the moment the answer lands instead of a render later, and without anyone comparing
   * transcript lengths to work out that something new arrived.
   */
  onAnswer?(conversationId: string, source: AuraMessageSource): void;
}

export interface AuraConversationController {
  transcript: AuraTranscriptMessage[];
  state: AuraState;
  failure: AuraFailure | null;
  busy: boolean;
  /** Null until the first message opens one. Voice playback needs it to name what to speak. */
  conversationId: string | null;
  send(message: string, source?: AuraMessageSource): void;
  retryLast(): void;
  startNewConversation(): void;
  markInputActive(active: boolean): void;
}

/**
 * Owns everything about a conversation that is not visual: the transcript, the request in flight,
 * the session id, and every failure path. Components below it render state and raise intent.
 *
 * <p>Two behaviours here are worth naming. A conversation is created on the first message rather
 * than when the panel opens, so browsing the site with the launcher visible costs no backend call
 * and creates no row. And a lost conversation — a restart of the local backend clears the
 * database, which will happen to the owner constantly — is recovered once, silently, by opening a
 * new one and resending. That is a single targeted recovery for a known cause, not a retry loop
 * around the pipeline.
 */
export function useAuraConversation({
  client,
  currentPath,
  onAnswer,
}: UseAuraConversationOptions): AuraConversationController {
  const api = useMemo(() => client ?? createAuraApiClient(), [client]);

  const [transcript, setTranscript] = useState<AuraTranscriptMessage[]>([]);
  const [state, setState] = useState<AuraState>("IDLE");
  const [failure, setFailure] = useState<AuraFailure | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  /** Guards against a double submit: a ref, because two clicks in one tick share a render. */
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const lastMessage = useRef<string | null>(null);
  const lastSource = useRef<AuraMessageSource>("TYPED");

  // The acknowledgement state is a moment, not a mode: it settles back to idle on its own.
  useEffect(() => {
    if (state !== "RESPONSE_READY") return;
    const timer = setTimeout(() => setState("IDLE"), RESPONSE_READY_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const appendAura = useCallback((message: Omit<AuraTranscriptMessage, "id" | "role">) => {
    setTranscript((current) => [...current, { id: nextId("aura"), role: "aura", ...message }]);
  }, []);

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    const existing = readStoredConversationId();
    if (existing) {
      setConversationId(existing);
      return existing;
    }

    const created = await api.createConversation();
    if (!created.ok) {
      setFailure(created);
      return null;
    }
    storeConversationId(created.value.conversationId);
    setConversationId(created.value.conversationId);
    return created.value.conversationId;
  }, [api]);

  const deliver = useCallback(
    async (text: string) => {
      let id = await ensureConversation();
      if (!id) {
        setState("ERROR");
        return;
      }

      let result = await api.sendMessage(id, text, currentPath);

      // The one recovery: the backend no longer knows this conversation (restarted, or its data
      // was cleared). Open a new one and send the message once more, so the visitor sees a reply
      // rather than an explanation of our persistence model.
      if (!result.ok && result.kind === "CONVERSATION_NOT_FOUND") {
        clearStoredConversationId();
        id = await ensureConversation();
        if (!id) {
          setState("ERROR");
          return;
        }
        result = await api.sendMessage(id, text, currentPath);
      }

      if (!result.ok) {
        setFailure(result);
        setState("ERROR");
        appendAura({ text: result.message, failed: true });
        return;
      }

      setFailure(null);
      appendAura({
        text: result.value.answer,
        sources: result.value.sources,
        diagnostics: result.value.diagnostics ?? null,
      });
      setState("RESPONSE_READY");
      onAnswer?.(id, lastSource.current);
    },
    // currentPath is a dependency rather than a ref: navigation is rare, and a request that is
    // already in flight keeps the path it was sent with, which is the correct context for it.
    [api, appendAura, currentPath, ensureConversation, onAnswer],
  );

  const run = useCallback(
    (text: string) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setState("THINKING");
      setFailure(null);
      void deliver(text).finally(() => {
        inFlight.current = false;
        setBusy(false);
      });
    },
    [deliver],
  );

  const send = useCallback(
    (message: string, source: AuraMessageSource = "TYPED") => {
      const text = message.trim();
      if (text.length === 0 || inFlight.current) return;
      lastMessage.current = text;
      lastSource.current = source;
      // Rendered immediately: the visitor's own words should never wait on a network call.
      setTranscript((current) => [...current, { id: nextId("user"), role: "user", text }]);
      run(text);
    },
    [run],
  );

  const retryLast = useCallback(() => {
    const text = lastMessage.current;
    if (!text || inFlight.current) return;
    // Drops the failure notice, not the visitor's message — they asked once and meant it.
    setTranscript((current) => {
      const last = current[current.length - 1];
      return last?.role === "aura" && last.failed ? current.slice(0, -1) : current;
    });
    run(text);
  }, [run]);

  const startNewConversation = useCallback(() => {
    if (inFlight.current) return;
    clearStoredConversationId();
    setTranscript([]);
    setFailure(null);
    setConversationId(null);
    lastMessage.current = null;
    lastSource.current = "TYPED";
    setState("IDLE");
  }, []);

  const markInputActive = useCallback((active: boolean) => {
    setState((current) => {
      if (current === "THINKING" || current === "ERROR") return current;
      return active ? "INPUT_ACTIVE" : "IDLE";
    });
  }, []);

  return {
    transcript,
    state,
    failure,
    busy,
    conversationId,
    send,
    retryLast,
    startNewConversation,
    markInputActive,
  };
}
