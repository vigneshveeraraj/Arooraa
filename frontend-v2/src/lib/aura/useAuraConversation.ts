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
   * Fired once per answer, with the conversation it belongs to, how the question was asked, and
   * how many things the visitor has said so far.
   *
   * <p>A callback rather than something the caller observes with an effect, so voice playback
   * starts at the moment the answer lands instead of a render later, and without anyone comparing
   * transcript lengths to work out that something new arrived. The turn count is passed rather
   * than derived by the caller for the same reason: it is a fact about the turn that just
   * happened, and this is where that turn happened.
   */
  onAnswer?(conversationId: string, source: AuraMessageSource, visitorTurns: number): void;
}

export interface AuraConversationController {
  transcript: AuraTranscriptMessage[];
  state: AuraState;
  failure: AuraFailure | null;
  busy: boolean;
  /** Null until the first message opens one. Voice playback needs it to name what to speak. */
  conversationId: string | null;
  /**
   * Which conversation this is, counting from zero and incremented by every reset (A5.2.2).
   *
   * <p>Two jobs, and they are the same job seen from either side of the boundary. Inside this hook
   * it is what an answer arriving after "New" compares itself against, so a reply to a conversation
   * the visitor has already left changes nothing on their screen. Outside it, it is what the panel
   * keys the composer on — changing a React key discards every piece of state that component holds,
   * which is how a draft is made unable to survive a reset without this file having to know that a
   * composer exists.
   */
  epoch: number;
  send(message: string, source?: AuraMessageSource): void;
  retryLast(): void;
  /**
   * Adds a turn Aura handled by itself: what the visitor chose, and what Aura said about it.
   *
   * <p>No network call of any kind, and specifically no provider call — the reply is written by us
   * and passed in. Used for guided navigation, where the client already knows both the choice and
   * the destination, so asking a language model to describe an action it did not take would cost
   * the visitor a wait and could only make the sentence less accurate.
   */
  acknowledge(choice: string, reply: string): void;
  /**
   * Ends this conversation and starts an empty one. Authoritative for everything this hook owns;
   * the panel composes it with the voice and brief resets — see AuraPanel.
   */
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

  /**
   * Which conversation is on screen. State, because the panel renders against it; a ref alongside,
   * because a request that started before a reset has to read the current value from inside its own
   * callback, where the state it closed over is by definition the old one.
   */
  const [epoch, setEpoch] = useState(0);
  const currentEpoch = useRef(0);

  /** Guards against a double submit: a ref, because two clicks in one tick share a render. */
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const lastMessage = useRef<string | null>(null);
  const lastSource = useRef<AuraMessageSource>("TYPED");
  /** How many things the visitor has said. A ref, because it is read inside an async callback. */
  const visitorTurns = useRef(0);

  // The acknowledgement state is a moment, not a mode: it settles back to idle on its own.
  useEffect(() => {
    if (state !== "RESPONSE_READY") return;
    const timer = setTimeout(() => setState("IDLE"), RESPONSE_READY_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const appendAura = useCallback((message: Omit<AuraTranscriptMessage, "id" | "role">) => {
    setTranscript((current) => [...current, { id: nextId("aura"), role: "aura", ...message }]);
  }, []);

  const ensureConversation = useCallback(async (turn: number): Promise<string | null> => {
    const existing = readStoredConversationId();
    if (existing) {
      setConversationId(existing);
      return existing;
    }

    const created = await api.createConversation();
    // "New" was pressed while this was in the air. The id belongs to a conversation that is no
    // longer on screen, and storing it would hand the conversation that replaced it the old one's
    // identity — the visitor would be told they had started again while still talking to the same
    // backend conversation.
    if (currentEpoch.current !== turn) return null;
    if (!created.ok) {
      setFailure(created);
      return null;
    }
    storeConversationId(created.value.conversationId);
    setConversationId(created.value.conversationId);
    return created.value.conversationId;
  }, [api]);

  const deliver = useCallback(
    async (text: string, turn: number) => {
      /*
       * Checked after every await, and checked before anything else — including before a null id
       * is treated as a failure, because a superseded request has not failed, it has been
       * abandoned. Past one of these points the visitor is in a different conversation, and an
       * answer to the previous one must not appear in it, must not put it into an error state, and
       * must not decide whether it is busy.
       */
      const superseded = () => currentEpoch.current !== turn;

      let id = await ensureConversation(turn);
      if (superseded()) return;
      if (!id) {
        setState("ERROR");
        return;
      }

      let result = await api.sendMessage(id, text, currentPath);
      if (superseded()) return;

      // The one recovery: the backend no longer knows this conversation (restarted, or its data
      // was cleared). Open a new one and send the message once more, so the visitor sees a reply
      // rather than an explanation of our persistence model.
      if (!result.ok && result.kind === "CONVERSATION_NOT_FOUND") {
        clearStoredConversationId();
        id = await ensureConversation(turn);
        if (superseded()) return;
        if (!id) {
          setState("ERROR");
          return;
        }
        result = await api.sendMessage(id, text, currentPath);
        if (superseded()) return;
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
        sequence: result.value.sequence,
        sources: result.value.sources,
        diagnostics: result.value.diagnostics ?? null,
      });
      setState("RESPONSE_READY");
      onAnswer?.(id, lastSource.current, visitorTurns.current);
    },
    // currentPath is a dependency rather than a ref: navigation is rare, and a request that is
    // already in flight keeps the path it was sent with, which is the correct context for it.
    [api, appendAura, currentPath, ensureConversation, onAnswer],
  );

  const run = useCallback(
    (text: string) => {
      if (inFlight.current) return;
      const turn = currentEpoch.current;
      inFlight.current = true;
      setBusy(true);
      setState("THINKING");
      setFailure(null);
      void deliver(text, turn).finally(() => {
        // The reset already cleared both of these for the conversation that replaced this one.
        // Clearing them again here would clear them on behalf of a message the visitor has sent
        // since — which is genuinely still in flight.
        if (currentEpoch.current !== turn) return;
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
      visitorTurns.current += 1;
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

  const acknowledge = useCallback((choice: string, reply: string) => {
    // Both turns in one update, so they are rendered together and the guided menu collapses once
    // rather than twice.
    setTranscript((current) => [
      ...current,
      { id: nextId("user"), role: "user", text: choice },
      { id: nextId("aura"), role: "aura", text: reply },
    ]);
    // The Spark's "just replied" pulse: Aura did reply, and this should read as the same kind of
    // event as an answer. A failure already on screen is the more important thing to be showing,
    // so it keeps the mark.
    setState((current) => (current === "ERROR" ? current : "RESPONSE_READY"));
    // Deliberately not counted as a visitor turn and deliberately not remembered as the last
    // message. The backend has no record of this exchange, so counting it would put the brief's
    // turn count out of step with the conversation it asks about, and "Try again" would re-send a
    // question the visitor never asked.
  }, []);

  const startNewConversation = useCallback(() => {
    /*
     * No early return when a request is in flight. "New" has to mean new even mid-request, and the
     * epoch is what makes that safe: the reply, whenever it lands, finds itself superseded and
     * touches nothing. The in-flight flag is cleared here so the empty conversation can be used
     * immediately instead of waiting on a request that no longer belongs to anything on screen.
     */
    currentEpoch.current += 1;
    setEpoch(currentEpoch.current);
    inFlight.current = false;
    setBusy(false);
    clearStoredConversationId();
    setTranscript([]);
    setFailure(null);
    setConversationId(null);
    lastMessage.current = null;
    lastSource.current = "TYPED";
    visitorTurns.current = 0;
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
    epoch,
    send,
    retryLast,
    acknowledge,
    startNewConversation,
    markInputActive,
  };
}
