import type { ReactNode } from "react";
import { CONCEPTS } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import { CampaignSectionHeader } from "./CampaignSectionHeader";
import { BrowserWindow, DeviceStage, Phone } from "./DeviceFrames";
import { ForgelineDesktop, ForgelineMobile } from "./concepts/Forgeline";
import { MaramLivingDesktop, MaramLivingMobile } from "./concepts/MaramLiving";
import { NorthbridgeDesktop, NorthbridgeMobile } from "./concepts/Northbridge";
import styles from "./CampaignConcepts.module.css";

type ConceptId = (typeof CONCEPTS.items)[number]["id"];

const PREVIEWS: Record<ConceptId, { address: string; desktop: ReactNode; mobile: ReactNode }> = {
  "maram-living": { address: "maramliving.in", desktop: <MaramLivingDesktop />, mobile: <MaramLivingMobile /> },
  forgeline: { address: "forgeline.co.in", desktop: <ForgelineDesktop />, mobile: <ForgelineMobile /> },
  northbridge: { address: "northbridgeadvisors.in", desktop: <NorthbridgeDesktop />, mobile: <NorthbridgeMobile /> },
};

/**
 * Three website design concepts for fictional businesses — the page's proof of design
 * quality. Each is labelled as an illustrative concept in visible text next to it.
 */
export function CampaignConcepts() {
  return (
    <section id="concepts" className={styles.section} aria-labelledby="concepts-title">
      <div className={styles.inner}>
        <CampaignSectionHeader id="concepts-title" eyebrow={CONCEPTS.eyebrow} title={CONCEPTS.title} lead={CONCEPTS.lead} />

        {CONCEPTS.items.map((concept, index) => {
          const preview = PREVIEWS[concept.id];
          return (
            <article
              key={concept.id}
              className={`${styles.concept} ${index % 2 === 1 ? styles.flip : ""}`}
              aria-labelledby={`concept-${concept.id}`}
            >
              <div className={styles.copy}>
                <p className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className={styles.type}>{concept.type}</p>
                <h3 id={`concept-${concept.id}`}>{concept.name}</h3>
                <p className={styles.description} lang="ta">
                  {concept.description}
                </p>
                <ul className={styles.features} aria-label={`${concept.name} website features`}>
                  {concept.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <p className={styles.disclaimer}>
                  <CampaignIcon name="info" className={styles.infoIcon} />
                  {CONCEPTS.disclaimer}
                </p>
              </div>
              <figure className={styles.visual}>
                <DeviceStage variant="concept">
                  <BrowserWindow address={preview.address}>{preview.desktop}</BrowserWindow>
                  <Phone>{preview.mobile}</Phone>
                </DeviceStage>
                <figcaption className={styles.srOnly}>
                  Desktop and mobile website design concept for {concept.name}, a fictional {concept.type.toLowerCase()} business.
                </figcaption>
              </figure>
            </article>
          );
        })}
      </div>
    </section>
  );
}
