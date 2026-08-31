"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  /** Renders as a navigation link (next/link) instead of a <button> when set. */
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  target?: string;
  rel?: string;
}

export function Button({
  variant = "primary",
  children,
  className,
  href,
  disabled = false,
  type = "button",
  onClick,
  target,
  rel,
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  if (href) {
    if (disabled) {
      // Anchors have no native disabled state — render inert text instead of a
      // clickable link that silently does nothing.
      return (
        <span className={classes} data-disabled="true" aria-disabled="true">
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} target={target} rel={rel} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
