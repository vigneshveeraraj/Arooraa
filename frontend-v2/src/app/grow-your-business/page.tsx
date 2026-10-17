import type { Metadata } from "next";
import { Noto_Sans_Tamil } from "next/font/google";
import { CampaignConcepts } from "@/components/campaign/CampaignConcepts";
import { CampaignContact } from "@/components/campaign/CampaignContact";
import { CampaignContrast } from "@/components/campaign/CampaignContrast";
import { CampaignExplore } from "@/components/campaign/CampaignExplore";
import { CampaignFooter } from "@/components/campaign/CampaignFooter";
import { CampaignHeader } from "@/components/campaign/CampaignHeader";
import { CampaignHero } from "@/components/campaign/CampaignHero";
import { CampaignIndustries } from "@/components/campaign/CampaignIndustries";
import { CampaignProcess } from "@/components/campaign/CampaignProcess";
import { CampaignSolutions } from "@/components/campaign/CampaignSolutions";
import { CampaignWhy } from "@/components/campaign/CampaignWhy";
import { CAMPAIGN_PATH, CAMPAIGN_SEO } from "@/lib/content/grow-your-business";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./page.module.css";

/*
 * Tamil Nadu campaign landing page.
 *
 * Deliberately outside the (public) route group: it has its own header and footer
 * (and no Aura widget), and the main English site never links here — visitors arrive
 * from campaign links. It is still indexable, with its own canonical URL; it is not
 * listed in sitemap.ts, which is the English site's index of its own pages.
 */

const base = pageMetadata({ title: CAMPAIGN_SEO.title, description: CAMPAIGN_SEO.description, path: CAMPAIGN_PATH });

export const metadata: Metadata = {
  ...base,
  openGraph: {
    ...base.openGraph,
    title: CAMPAIGN_SEO.ogTitle,
    description: CAMPAIGN_SEO.ogDescription,
    locale: "ta_IN",
    images: [
      {
        url: CAMPAIGN_SEO.ogImage,
        width: 1200,
        height: 630,
        alt: "AROORAA — websites, AI and automation for Tamil Nadu businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: CAMPAIGN_SEO.ogTitle,
    description: CAMPAIGN_SEO.ogDescription,
    images: [CAMPAIGN_SEO.ogImage],
  },
};

// The root layout's Geist has no Tamil glyphs. Noto Sans Tamil is self-hosted by
// next/font, loaded on this page only, and sits after Geist in the font stack, so Latin
// text stays Geist and Tamil renders the same on every device.
const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-campaign-tamil",
  display: "swap",
});

export default function GrowYourBusinessPage() {
  return (
    <div className={`${styles.page} ${notoSansTamil.variable}`}>
      <a className={styles.skipLink} href="#campaign-main">
        Skip to main content
      </a>
      <CampaignHeader />
      <main id="campaign-main" tabIndex={-1} className={styles.main}>
        <CampaignHero />
        <CampaignSolutions />
        <CampaignConcepts />
        <CampaignContrast />
        <CampaignProcess />
        <CampaignIndustries />
        <CampaignWhy />
        <CampaignExplore />
        <CampaignContact />
      </main>
      <CampaignFooter />
    </div>
  );
}
