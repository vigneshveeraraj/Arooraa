import type { ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  /** Restrained by default — only opts into hover elevation when the card is actually clickable. */
  interactive?: boolean;
  children: ReactNode;
  className?: string;
}

export function Card({ interactive = false, children, className }: CardProps) {
  return (
    <div className={[styles.card, interactive ? styles.interactive : "", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
