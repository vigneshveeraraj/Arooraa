"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { AuraApiClient } from "@/lib/aura/client";
import { useAuraConversation } from "@/lib/aura/useAuraConversation";
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
export function AuraWidget({ client }: AuraWidgetProps) {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Read here rather than at module scope so it is a plain build-time substitution with no
  // module-initialisation order to reason about. Off unless the flag is exactly "true"; a
  // visitor-facing build never sets it, and the backend has its own separate switch besides.
  const diagnosticsEnabled = process.env.NEXT_PUBLIC_AURA_DIAGNOSTICS === "true";

  const controller = useAuraConversation({ client, currentPath: pathname ?? null });

  const close = useCallback(() => setOpen(false), []);

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
          state={controller.state}
          panelId={PANEL_ID}
          buttonRef={launcherRef}
        />
      ) : (
        <AuraPanel
          id={PANEL_ID}
          onClose={close}
          controller={controller}
          diagnosticsEnabled={diagnosticsEnabled}
        />
      )}
    </>
  );
}
