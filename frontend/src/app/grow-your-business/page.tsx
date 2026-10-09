import type { Metadata } from "next";
import { Noto_Sans_Tamil } from "next/font/google";
import { CampaignFooter } from "./_components/CampaignFooter";
import { CampaignHeader } from "./_components/CampaignHeader";
import { Comparison } from "./_components/Comparison";
import { ContactCta } from "./_components/ContactCta";
import { ExploreArooraa } from "./_components/ExploreArooraa";
import { Hero } from "./_components/Hero";
import { Industries } from "./_components/Industries";
import { Process } from "./_components/Process";
import { Solutions } from "./_components/Solutions";
import { WhatsAppFloat } from "./_components/WhatsAppFloat";
import { WhyArooraa } from "./_components/WhyArooraa";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Business Website, AI & Automation Solutions | AROORAA",
  description: "Professional websites, customer enquiries, business automation and AI solutions for growing businesses across Tamil Nadu. Talk to AROORAA Technologies.",
  alternates: { canonical: "https://www.arooraa.com/grow-your-business" },
  openGraph: {
    title: "உங்கள் Business-ஐ Digital-ஆ மாற்றலாம் | AROORAA",
    description: "Website முதல் AI & Automation வரை — உங்கள் business-க்கு தேவையான technology solutions.",
    url: "https://www.arooraa.com/grow-your-business",
    type: "website",
  },
};

// Manrope (from the root layout) has no Tamil glyphs. Noto Sans Tamil is self-hosted by
// next/font, loaded only on this page, and sits after Manrope in the font stack so
// Latin text stays Manrope while Tamil text renders consistently on every OS.
const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-campaign-tamil",
  display: "swap",
});

export default function GrowYourBusinessPage() {
  return (
    <div className={`${styles.page} ${notoSansTamil.variable}`}>
      <a className={styles.skipLink} href="#main">
        Skip to main content
      </a>
      <CampaignHeader />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Hero />
        <Solutions />
        <Comparison />
        <Process />
        <Industries />
        <WhyArooraa />
        <ExploreArooraa />
        <ContactCta />
      </main>
      <CampaignFooter />
      <WhatsAppFloat />
    </div>
  );
}
