import type { ElementType, ReactNode } from "react";
import styles from "./Section.module.css";

type SectionTone = "light" | "dark";
type SectionSpacing = "default" | "compact" | "none";

interface SectionProps {
  /** Dark is a deliberate, contained choice (see tokens.css) — not a global dark-mode toggle. */
  tone?: SectionTone;
  spacing?: SectionSpacing;
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Section({
  tone = "light",
  spacing = "default",
  as: Tag = "section",
  id,
  className,
  children,
}: SectionProps) {
  const spacingClass =
    spacing === "compact" ? styles.spacingCompact : spacing === "none" ? styles.spacingNone : styles.spacingDefault;
  return (
    <Tag id={id} data-tone={tone} className={[styles.section, spacingClass, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
