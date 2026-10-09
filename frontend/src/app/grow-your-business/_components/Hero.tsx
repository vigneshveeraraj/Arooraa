import { HeroIllustration } from "./HeroIllustration";
import { Icon } from "./Icon";
import { CONTACT } from "./content";
import { keepSuffix } from "./keepSuffix";
import styles from "./Hero.module.css";
import ui from "./ui.module.css";

const ASSURANCES = ["Business-focused approach", "Secure development", "Practical solutions"] as const;

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.badge} lang="ta">
            <span className={styles.badgeDot} aria-hidden="true" />
            {keepSuffix("Tamil Nadu business-களுக்கான Digital Solutions")}
          </p>

          <h1 id="hero-title" className={styles.title} lang="ta">
            {keepSuffix("உங்கள் Business-ஐ")} <span className={styles.highlight}>{keepSuffix("Digital-ஆ")}</span> மாற்றலாம்
          </h1>

          <p className={styles.lead} lang="ta">
            {keepSuffix(
              "Professional Website, AI மற்றும் Automation மூலம் உங்கள் Business-க்கு அதிக Enquiries, நல்ல Customer Experience மற்றும் திறமையான Operations உருவாக்க உதவுகிறோம்.",
            )}
          </p>

          <div className={styles.actions}>
            <a className={`${ui.button} ${ui.whatsapp}`} href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={20} />
              <span lang="ta">{keepSuffix("WhatsApp-ல் பேசலாம்")}</span>
            </a>
            <a className={`${ui.button} ${ui.outline}`} href="#contact">
              Free Consultation
              <Icon name="arrowRight" size={18} />
            </a>
          </div>

          <p className={styles.call}>
            <span lang="ta">அல்லது நேரடியாக அழைக்கவும்:</span>{" "}
            <a href={`tel:${CONTACT.phoneE164}`}>{CONTACT.phoneDisplay}</a>
          </p>

          <ul className={styles.assurances}>
            {ASSURANCES.map((item) => (
              <li key={item}>
                <Icon name="check" size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
