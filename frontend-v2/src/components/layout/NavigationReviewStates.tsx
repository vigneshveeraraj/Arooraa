"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { SiteHeader } from "./SiteHeader";
import styles from "./NavigationReviewStates.module.css";

/**
 * Every state of the header navigation on one page, so A5.2.3 can be judged by looking at it.
 *
 * <p>The same arrangement the Aura review page uses, and for the same reason: real components and
 * real stylesheets, driven into a state a screenshot cannot click its way into. `?only=<id>` shows
 * one state filling the viewport, and `?device=widths` frames one state at the four review widths,
 * each in its own iframe so a "390px" capture is genuinely 390px rather than a narrowed desktop.
 *
 * <p>This file is reached only from `page.review.tsx`, which is not a page in a production build.
 */

interface ReviewState {
  id: string;
  title: string;
  note: string;
  frame: ReactNode;
}

/** The widths the drawer has to hold at, as everywhere else in this repository. */
const REVIEW_WIDTHS = [320, 375, 390, 430];
const PHONE_HEIGHT = 844;

const STATES: ReviewState[] = [
  {
    id: "desktop-products",
    title: "Products menu — desktop",
    note: "The four canonical products, each with one quiet line, and the index page kept in reach now that the top-level item is a button.",
    frame: (
      <div className={styles.desktop}>
        <SiteHeader initialOpenSection="/products" />
        <div className={styles.pageBelow}>
          <p>Page content sits under the panel — the menu is above it, not pushing it down.</p>
        </div>
      </div>
    ),
  },
  {
    id: "desktop-services",
    title: "Services menu — desktop",
    note: "The six approved service groups. No descriptors here: their names already say what they are, and six lines would make this a mega-menu.",
    frame: (
      <div className={styles.desktop}>
        <SiteHeader initialOpenSection="/services" />
        <div className={styles.pageBelow}>
          <p>Page content sits under the panel — the menu is above it, not pushing it down.</p>
        </div>
      </div>
    ),
  },
  {
    id: "desktop-focus",
    title: "Keyboard focus — desktop",
    note: "The same menu reached by keyboard: the item carries the site's focus ring, and Escape closes it and hands focus back.",
    frame: (
      <div className={styles.desktop}>
        <FocusedHeader />
        <div className={styles.pageBelow}>
          <p>Tab reaches the item; Enter or Space opens it; Tab then walks the links inside.</p>
        </div>
      </div>
    ),
  },
  {
    id: "mobile-products",
    title: "Products accordion — mobile",
    note: "No floating panel on a phone: the drawer owns the viewport, so the section expands in place.",
    frame: <MobileNav id="review-products" open onClose={() => {}} initialExpanded={["/products"]} />,
  },
  {
    id: "mobile-services",
    title: "Services accordion — mobile",
    note: "The same six services, at a 44px row each, with the CTA still at the foot of the drawer.",
    frame: <MobileNav id="review-services" open onClose={() => {}} initialExpanded={["/services"]} />,
  },
];

/**
 * The header with its menu open and the item focused, which is the one state a capture cannot
 * otherwise reach: headless browsers take screenshots, they do not press Tab.
 */
function FocusedHeader() {
  useEffect(() => {
    document.querySelector<HTMLElement>('button[aria-expanded="true"]')?.focus();
  }, []);
  return <SiteHeader initialOpenSection="/products" />;
}

export function NavigationReviewStates({ bannerClassName }: { bannerClassName?: string }) {
  const [query, setQuery] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    // Read from the URL rather than a router hook — see AuraReviewStates for why this genuinely
    // has to happen after mount on a statically exported page.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setQuery(new URLSearchParams(window.location.search));
  }, []);

  // Nothing until the URL has been read: rendering the full grid first and narrowing a moment
  // later is what left stale compositor artefacts in earlier captures.
  if (query === null) return null;

  const only = query.get("only");
  const device = query.get("device");

  const banner = only ? null : (
    <div className={bannerClassName}>
      Internal navigation review — not part of public navigation. Remove before production cutover.
    </div>
  );

  if (device === "widths") {
    const state = STATES.find((candidate) => candidate.id === (only ?? "mobile-products")) ?? STATES[0]!;
    return (
      <div className={styles.phones}>
        {banner}
        {REVIEW_WIDTHS.map((width) => (
          <figure key={width} className={styles.phone}>
            <figcaption>
              {width}px — {state.title}
            </figcaption>
            <iframe
              title={`Navigation at ${width}px — ${state.title}`}
              src={`?only=${state.id}`}
              width={width}
              height={PHONE_HEIGHT}
            />
          </figure>
        ))}
      </div>
    );
  }

  const shown = only ? STATES.filter((state) => state.id === only) : STATES;

  return (
    <div className={styles.page} data-mode={only ? "solo" : "all"}>
      {banner}
      {only ? null : (
        <header className={styles.intro}>
          <h1 className="text-h1">Navigation — visual review</h1>
          <p className={styles.lead}>
            The header&apos;s section menus and the mobile drawer, from the real components. Add{" "}
            <code>?only=desktop-products</code> to see one state alone, or{" "}
            <code>?only=mobile-products&amp;device=widths</code> to see the drawer at 320, 375, 390
            and 430.
          </p>
        </header>
      )}

      {shown.map((state) => (
        <section className={styles.section} id={state.id} key={state.id}>
          {only ? null : (
            <>
              <h2 className="text-h3">{state.title}</h2>
              <p className={styles.note}>{state.note}</p>
            </>
          )}
          {state.frame}
        </section>
      ))}
    </div>
  );
}
