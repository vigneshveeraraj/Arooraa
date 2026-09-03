import type { Metadata } from "next";
import { AuraReviewStates } from "@/components/aura/AuraReviewStates";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Aura — Internal Visual Review",
  robots: { index: false, follow: false },
};

/**
 * Every Aura state on one page, so the experience can be judged by looking at it rather than by
 * reading a test report. Follows the existing `/design-system` precedent: noindex, banner, and no
 * production page content.
 *
 * <p>Real components and real stylesheets throughout — the panels below are the same
 * {@code AuraPanel} the website mounts, driven by fixed data instead of a backend, so what is on
 * screen is what a visitor gets. This route sits outside the {@code (public)} group, so it has no
 * site chrome and no live Aura of its own; every state below is deliberately placed rather than
 * happening to be open.
 */
export default function AuraReviewPage() {
  return (
    <main>
      <AuraReviewStates bannerClassName={styles.devBanner} />
    </main>
  );
}
