"use client";

import type { RefObject } from "react";
import type { AuraState } from "@/lib/aura/state";
import { AuraMark } from "./AuraMark";
import styles from "./AuraLauncher.module.css";

interface AuraLauncherProps {
  onOpen: () => void;
  state: AuraState;
  panelId: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
}

/**
 * The only Aura UI in the initial bundle. Everything the panel needs — message rendering, the
 * composer, the rich-text parser — is loaded when this is pressed, so a visitor who never opens
 * Aura pays for one button and one small mark.
 */
export function AuraLauncher({ onOpen, state, panelId, buttonRef }: AuraLauncherProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.launcher}
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={false}
      aria-controls={panelId}
    >
      <AuraMark state={state} />
      <span className={styles.label}>Ask Aura</span>
    </button>
  );
}
