import type { Metadata } from "next";
import { NavigationReviewStates } from "@/components/layout/NavigationReviewStates";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Navigation — Internal Visual Review",
  robots: { index: false, follow: false },
};

/**
 * The header's section menus and the mobile drawer, on one page (A5.2.3).
 *
 * <p>Follows the existing review-page precedent exactly: real components, real stylesheets,
 * noindex, a banner, and `page.review.tsx` so that a production build finds no route here at all.
 */
export default function NavigationReviewPage() {
  return (
    <main>
      <NavigationReviewStates bannerClassName={styles.devBanner} />
    </main>
  );
}
