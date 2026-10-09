import { CAMPAIGN_CONTACT, CONTACT_SECTION, HERO } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import styles from "./CampaignContact.module.css";

export function CampaignContact() {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.grid}>
        <div>
          <p className={styles.eyebrow}>{CONTACT_SECTION.eyebrow}</p>
          <h2 id="contact-title" lang="ta">
            {CONTACT_SECTION.title}
          </h2>
          <p className={styles.lead} lang="ta">
            {CONTACT_SECTION.lead}
          </p>
        </div>
        <div className={styles.panel}>
          <a className={styles.whatsapp} href={CAMPAIGN_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <CampaignIcon name="whatsapp" className={styles.waIcon} />
            <span lang="ta">{HERO.whatsappLabel}</span>
          </a>
          <a className={styles.channel} href={`tel:${CAMPAIGN_CONTACT.phoneE164}`}>
            <span className={styles.channelIcon}>
              <CampaignIcon name="phone" />
            </span>
            <span>
              <small>Call us</small>
              {CAMPAIGN_CONTACT.phoneDisplay}
            </span>
          </a>
          <a className={styles.channel} href={`mailto:${CAMPAIGN_CONTACT.email}`}>
            <span className={styles.channelIcon}>
              <CampaignIcon name="mail" />
            </span>
            <span>
              <small>Email us</small>
              {CAMPAIGN_CONTACT.email}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
