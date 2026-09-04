"use client";

import { useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import type { NavChild, NavSection } from "@/lib/content/navigation";
import styles from "./HeaderNavMenu.module.css";

interface HeaderNavMenuProps {
  section: NavSection & { children: NavChild[] };
  open: boolean;
  /** The visitor is somewhere under this section right now. */
  active: boolean;
  /** A pointer arrived, or left. Advisory: the header decides what it means. */
  onHoverOpen: () => void;
  onHoverClose: () => void;
  /** The item itself was pressed — by mouse, by touch, or by Enter or Space. */
  onPress: () => void;
  /** Something inside the panel was used, or Escape was pressed. Always closes. */
  onClose: () => void;
}

/**
 * One header section that opens a menu (A5.2.3).
 *
 * <p>A disclosure, not an ARIA menu: a button that expands a list of ordinary links. The menu
 * pattern is for application menus and buys arrow-key roving at the cost of hand-managing focus,
 * typeahead and Home/End — and getting any of that subtly wrong is worse for a screen-reader
 * visitor than the plain pattern is. These are seven links to seven pages, so Tab moves through
 * them exactly as it does everywhere else on the site, Escape closes, and nothing is reimplemented.
 *
 * <p>Hover opens it too, because a header this shape is expected to. The button and the panel sit
 * inside one wrapper with no gap between them, so a pointer travelling from one to the other never
 * leaves the element that is listening — which is why closing needs no timer, and why the menu
 * cannot flicker shut under the pointer on its way in. Touch is excluded by pointer type, so a tap
 * is a press and opens once, rather than opening on the enter and closing on the press.
 *
 * <p>Hover and press are reported separately because they mean different things, and conflating
 * them is how these menus usually go wrong: a mouse arrives, the menu opens, the visitor clicks the
 * item they came for — and a plain toggle reads that click as "close", so the thing they asked for
 * disappears. Hovering opens; pressing pins it open; pressing a pinned menu closes it; and the
 * pointer leaving closes only what it opened itself.
 */
export function HeaderNavMenu({
  section,
  open,
  active,
  onHoverOpen,
  onHoverClose,
  onPress,
  onClose,
}: HeaderNavMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = `header-menu-${section.href.replace(/\W+/g, "-")}`;

  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (event.key !== "Escape" || !open) return;
    // Focus is somewhere inside the panel that is about to disappear, so it has to be put back
    // deliberately: left alone it falls to the document body, and the next Tab restarts at the top
    // of the page rather than continuing along the header.
    event.stopPropagation();
    onClose();
    triggerRef.current?.focus();
  }

  function handlePointerEnter(event: PointerEvent<HTMLLIElement>) {
    if (event.pointerType === "mouse") onHoverOpen();
  }

  function handlePointerLeave(event: PointerEvent<HTMLLIElement>) {
    if (event.pointerType === "mouse") onHoverClose();
  }

  return (
    <li
      className={styles.section}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${active ? styles.triggerActive : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onPress}
      >
        {section.label}
        <svg className={styles.chevron} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
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

      {open ? (
        <div id={panelId} className={styles.panel}>
          <ul className={styles.list}>
            {section.children.map((child) => (
              <li key={child.href}>
                <Link href={child.href} className={styles.item} onClick={onClose}>
                  <span className={styles.name}>{child.label}</span>
                  {child.descriptor ? (
                    <span className={styles.descriptor}>{child.descriptor}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          {/* The section's own index page. The trigger is a button now, so without this row the
              /products and /services pages would have lost their place in the header entirely. */}
          <Link href={section.href} className={styles.all} onClick={onClose}>
            All {section.label.toLowerCase()}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}
    </li>
  );
}
