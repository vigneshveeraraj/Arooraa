"use client";

import { useEffect, useState } from "react";

/**
 * The exact width at which {@link AuraPanel} switches from a bounded side panel to a full-viewport
 * sheet (see the `@media (max-width: 600px)` block in AuraPanel.module.css — keep the two in sync).
 * Internal navigation on the sheet layout covers the destination page entirely, which is why that
 * layout, not any general site breakpoint, is what decides whether Aura should collapse itself
 * after opening a page.
 */
export const AURA_COMPACT_BREAKPOINT_PX = 600;

function matchesCompact(): boolean {
  // SSR has no viewport to ask; this value only ever feeds a behavioural decision inside an event
  // handler (whether to collapse Aura after a navigation), never anything rendered into markup, so
  // there is no hydration mismatch to guard against here — just a sensible default before mount.
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${AURA_COMPACT_BREAKPOINT_PX}px)`).matches;
}

/**
 * Whether Aura is currently rendering as the full-viewport sheet rather than the side panel.
 */
export function useAuraCompactViewport(): boolean {
  const [compact, setCompact] = useState(matchesCompact);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${AURA_COMPACT_BREAKPOINT_PX}px)`);
    const onChange = (event: MediaQueryListEvent) => setCompact(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return compact;
}
