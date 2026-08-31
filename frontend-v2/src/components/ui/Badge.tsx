import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span className={["text-label", styles.badge, styles[variant], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
