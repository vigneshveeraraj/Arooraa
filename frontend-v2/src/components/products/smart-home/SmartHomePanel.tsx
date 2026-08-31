import type { ReactNode } from "react";
import styles from "./SmartHomePanel.module.css";

interface SmartHomePanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared Smart Home visual primitive (P5) — a plain rounded surface reused
 * across every Smart Home concept visual (hero, energy, local-first, water,
 * manual control, engineering) so the page reads as one coherent visual
 * family. Smart Home has no single "device" the way Mindra has a phone or
 * Smart Mirror has a mirror — the product is the home itself — so the
 * shared primitive here is a restrained card surface rather than a device
 * frame.
 */
export function SmartHomePanel({ children, className }: SmartHomePanelProps) {
  return <div className={[styles.panel, className].filter(Boolean).join(" ")}>{children}</div>;
}
