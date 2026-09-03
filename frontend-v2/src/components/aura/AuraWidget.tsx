"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import type { AuraApiClient } from "@/lib/aura/client";
import { useAuraConversation, type AuraMessageSource } from "@/lib/aura/useAuraConversation";
import { mergeAuraState } from "@/lib/aura/state";
import { useAuraVoice, voicePresence } from "@/lib/aura/voice/useAuraVoice";
import type { AuraVoiceApiClient } from "@/lib/aura/voice/voice-client";
import { useAuraBrief } from "@/lib/aura/brief/useAuraBrief";
import type { AuraBriefApiClient } from "@/lib/aura/brief/brief-client";
import { createAuraFeedbackClient, type AuraFeedbackClient } from "@/lib/aura/feedback";
import { AuraLauncher } from "./AuraLauncher";

/**
 * The panel and everything under it — message rendering, the composer, the rich-text parser — are
 * fetched when Aura is first opened, not when the page loads. A visitor who never opens Aura
 * downloads the launcher and nothing else.
 */
const AuraPanel = dynamic(() => import("./AuraPanel").then((module) => module.AuraPanel), {
  ssr: false,
});

const PANEL_ID = "aura-panel";

interface AuraWidgetProps {
  /** Injected by tests; production always uses the real client. */
  client?: AuraApiClient;
  /** Injected by tests; production always uses the real client. */
  voiceClient?: AuraVoiceApiClient;
  /** Injected by tests; production always uses the real client. */
  briefClient?: AuraBriefApiClient;
  /** Injected by tests; production always uses the real client. */
  feedbackClient?: AuraFeedbackClient;
}

/**
 * Aura on the website. Mounted once in the public layout, so it is present on every page and
 * survives navigation between them — which is what lets a visitor open Aura on the home page, walk
 * to /products/mesa, and ask "tell me more about this" with the conversation still going.
 *
 * <p>Owns two things and delegates everything else: whether the panel is open, and the
 * conversation controller. The controller lives here rather than inside the panel so closing Aura
 * does not throw away the conversation.
 */
export function AuraWidget({ client, voiceClient, briefClient, feedbackClient }: AuraWidgetProps) {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // The developer inspector's gate, and deliberately two conditions rather than one (A4.2).
  //
  // Both halves are build-time substitutions, so in any production build this is the literal
  // `false` — `next build` never sets NODE_ENV to "development" — and the branch, along with the
  // inspector it would have rendered, is dropped before the bundle is written. A flag alone would
  // have left a switch that a stray environment variable could flip on a deployed site; this
  // cannot be turned on by configuration, only by running `next dev`.
  const devDiagnostics =
    process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_AURA_DIAGNOSTICS === "true";

  const voice = useAuraVoice({ client: voiceClient });
  const brief = useAuraBrief({ client: briefClient });
  const feedback = useMemo(() => feedbackClient ?? createAuraFeedbackClient(), [feedbackClient]);

  // Both of the things that happen when an answer lands, fired as one event the moment it does
  // rather than noticed later by watching the transcript grow. Speaking has to follow a spoken
  // question immediately; the brief check has to see the turn that was just recorded.
  const onAnswer = useCallback(
    (conversationId: string, source: AuraMessageSource, visitorTurns: number) => {
      voice.announceAnswer(conversationId, source === "VOICE");
      brief.refresh(conversationId, visitorTurns);
    },
    [brief, voice],
  );

  const controller = useAuraConversation({
    client,
    currentPath: pathname ?? null,
    onAnswer,
  });

  const rate = useCallback(
    (sequence: number, rating: "HELPFUL" | "NOT_HELPFUL") => {
      // No conversation, nothing to rate. Cannot happen from the UI — the control only appears
      // under an answer, and an answer implies a conversation — but the type allows it.
      if (!controller.conversationId) return;
      try {
        feedback.rate(controller.conversationId, sequence, rating);
      } catch {
        // Swallowed here rather than trusted to the client, for the same reason the backend's
        // recorder swallows its own failures: a visitor who was kind enough to answer must never
        // be shown an error about our analytics, and a conversation must never end because of one.
        // This runs inside a React event handler, where an escaping throw would tear down the tree.
      }
    },
    [controller.conversationId, feedback],
  );

  const close = useCallback(() => {
    // Closing the panel ends anything voice is doing. A conversation survives a close and is
    // meant to; a microphone that stays open, or an answer that keeps talking to a page the
    // visitor has moved on from, is a different thing entirely.
    voice.cancelListening();
    voice.stopSpeaking();
    setOpen(false);
  }, [voice]);

  // The browser's back button should dismiss an open panel rather than leaving the visitor on a
  // different page with a conversation still floating over it.
  useEffect(() => {
    if (!open) return;
    const onPopState = () => setOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [open]);

  // Focus returns to the launcher on close, and it has to happen here rather than in the panel's
  // own cleanup: the launcher does not exist while the panel is open, so by the time the panel
  // tears down there is nothing yet to focus. This effect runs after the launcher is back.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      {!open ? (
        <AuraLauncher
          onOpen={() => setOpen(true)}
          state={mergeAuraState(controller.state, voicePresence(voice.status))}
          panelId={PANEL_ID}
          buttonRef={launcherRef}
        />
      ) : (
        <AuraPanel
          id={PANEL_ID}
          onClose={close}
          controller={controller}
          devDiagnostics={devDiagnostics}
          onNavigate={router.push}
          voice={voice}
          brief={brief}
          onRate={rate}
        />
      )}
    </>
  );
}
