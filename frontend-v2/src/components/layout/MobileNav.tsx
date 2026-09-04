"use client";

import { useEffect, useRef, useState } from "react";
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
  /**
   * Sections expanded on mount, by href. Only the internal navigation review page sets it, for the
   * same reason the header has its own: a screenshot cannot press an accordion open.
   */
  initialExpanded?: string[];
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

export function MobileNav({
  id,
  open,
  onClose,
  returnFocusRef,
  initialExpanded = [],
}: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  /** Which sections the visitor has expanded, by href. Several may be open at once — this is a
   * list they are scrolling, not a row of panels competing for the same space. */
  const [expanded, setExpanded] = useState<string[]>(initialExpanded);

  /*
   * Collapsed again once the drawer closes, so it always opens on the same short list.
   *
   * <p>Adjusted during render rather than in an effect — React's own pattern for state derived
   * from a changing prop, and the one AuraPanel already uses. As an effect it was worse twice
   * over: it cascaded an extra render, and depending on `initialExpanded` (a prop with a default,
   * so a new array every render) made it run on every render, set state, and render again.
   */
  const [drawerWasOpen, setDrawerWasOpen] = useState(open);
  if (open !== drawerWasOpen) {
    setDrawerWasOpen(open);
    if (!open) setExpanded(initialExpanded);
  }

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const elementToRefocus = returnFocusRef?.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Read at the moment Tab is pressed rather than when the drawer opened: expanding Products
      // adds four links to the panel, and a list captured on open would trap focus in front of
      // them — the visitor would tab past the accordion they had just opened.
      const focusable = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
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
            {PRIMARY_NAV_LINKS.map((link) => {
              /*
               * An accordion rather than the desktop panel, and not because a floating menu is
               * hard on a phone — because there is nothing for it to float over. The drawer owns
               * the viewport, so the honest shape is a list that grows.
               */
              if (link.children) {
                const isExpanded = expanded.includes(link.href);
                return (
                  <li key={link.href}>
                    <button
                      type="button"
                      className={styles.sectionToggle}
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpanded((current) =>
                          isExpanded
                            ? current.filter((href) => href !== link.href)
                            : [...current, link.href],
                        )
                      }
                    >
                      {link.label}
                      <svg
                        className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ""}`}
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M2.5 4.5 6 8l3.5-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isExpanded ? (
                      <ul className={styles.subList}>
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link href={child.href} className={styles.subLink} onClick={onClose}>
                              {child.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link href={link.href} className={styles.subLink} onClick={onClose}>
                            All {link.label.toLowerCase()}
                          </Link>
                        </li>
                      </ul>
                    ) : null}
                  </li>
                );
              }

              return (
                <li key={link.href}>
                  <Link href={link.href} onClick={onClose}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Button href={START_PROJECT_LINK.href} variant="primary" className={styles.cta} onClick={onClose}>
          {START_PROJECT_LINK.label}
        </Button>
      </div>
    </>
  );
}
