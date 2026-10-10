import { CAMPAIGN_CONTACT, HERO } from "@/lib/content/grow-your-business";
import { CampaignIcon, type CampaignIconName } from "./CampaignIcon";
import { DeviceStage, Laptop, Phone } from "./DeviceFrames";
import { NilaaHomesDesktop, NilaaHomesMobile } from "./concepts/NilaaHomes";
import styles from "./CampaignHero.module.css";

/** What AROORAA connects behind a website — each note names the service it represents. */
const ANNOTATIONS: { icon: CampaignIconName; tone: string; title: string; detail: string; service: string }[] = [
  { icon: "whatsapp", tone: "#0f7d43", title: "New enquiry · Site visit", detail: "From the website, via WhatsApp", service: "Enquiries" },
  { icon: "sparkles", tone: "#1f4fd8", title: "Auto-reply sent", detail: "Brochure & location shared", service: "Automation" },
  { icon: "mapPin", tone: "#c5221f", title: "Google Business Profile", detail: "Directions · Call · Website", service: "Marketing" },
];

export function CampaignHero() {
  return (
    <section className={styles.hero} aria-labelledby="campaign-hero-title">
      <div className={styles.grid}>
        <div className={styles.copy}>
          <p className={styles.badge} lang="ta">
            <b>AROORAA</b>
            <span>{HERO.badge}</span>
          </p>
          <h1 id="campaign-hero-title" className={styles.title} lang="ta">
            {HERO.titleStart} <span className={styles.accent}>{HERO.titleAccent}</span> {HERO.titleEnd}
          </h1>
          <p className={styles.lead} lang="ta">
            {HERO.lead}
          </p>
          <div className={styles.ctas}>
            <a className={styles.primary} href="#contact">
              {HERO.consultationLabel}
              <CampaignIcon name="arrowRight" className={styles.ctaIcon} />
            </a>
            <a className={styles.ghost} href={CAMPAIGN_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <CampaignIcon name="whatsapp" className={`${styles.ctaIcon} ${styles.waIcon}`} />
              <span lang="ta">{HERO.whatsappLabel}</span>
            </a>
          </div>
          <p className={styles.call}>
            <span lang="ta">{HERO.callPrompt}</span>{" "}
            <a href={`tel:${CAMPAIGN_CONTACT.phoneE164}`}>{CAMPAIGN_CONTACT.phoneDisplay}</a>
          </p>
          <ul className={styles.assurances}>
            {HERO.assurances.map((item) => (
              <li key={item}>
                <CampaignIcon name="check" className={styles.checkIcon} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure className={styles.visual}>
          <DeviceStage variant="hero">
            <Laptop>
              <NilaaHomesDesktop />
            </Laptop>
            <Phone>
              <NilaaHomesMobile />
            </Phone>
            {ANNOTATIONS.map((note, index) => (
              <div key={note.service} className={`${styles.note} ${styles[`note${index + 1}`]}`} aria-hidden="true">
                <span className={styles.noteIcon} style={{ background: note.tone }}>
                  <CampaignIcon name={note.icon} />
                </span>
                <span>
                  <b>{note.title}</b>
                  <small>{note.detail}</small>
                </span>
                <span className={styles.noteTag}>{note.service}</span>
              </div>
            ))}
          </DeviceStage>
          <figcaption className={styles.caption}>{HERO.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
