"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PRIMARY_NAV_LINKS, START_PROJECT_LINK } from "@/lib/content/navigation";
import styles from "./MobileNav.module.css";

interface MobileNavProps {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Focus returns here on close — normally the header's own menu-toggle button. */
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

export function MobileNav({ id, open, onClose, returnFocusRef }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusable = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
    focusable[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const elementToRefocus = returnFocusRef?.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      elementToRefocus?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <>
      <div className={styles.backdrop} aria-hidden="true" onClick={onClose} />
      <div id={id} ref={panelRef} role="dialog" aria-modal="true" aria-label="Site navigation" className={styles.panel}>
        <nav aria-label="Mobile">
          <ul className={styles.navList}>
            {PRIMARY_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={onClose}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Button href={START_PROJECT_LINK.href} variant="primary" className={styles.cta} onClick={onClose}>
          {START_PROJECT_LINK.label}
        </Button>
      </div>
    </>
  );
}
