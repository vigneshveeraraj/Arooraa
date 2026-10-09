import { Icon } from "./Icon";
import { CONTACT } from "./content";
import { keepSuffix } from "./keepSuffix";
import styles from "./ContactCta.module.css";
import ui from "./ui.module.css";

export function ContactCta() {
  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>Free Consultation</p>
          <h2 id="contact-title" className={styles.title} lang="ta">
            {keepSuffix("உங்கள் Business-க்கு அடுத்த step எடுக்கலாமா?")}
          </h2>
          <p className={styles.lead} lang="ta">
            {keepSuffix(
              "உங்கள் requirements பற்றி பேசலாம். Website, AI அல்லது Automation — உங்கள் Business-க்கு பொருத்தமான approach-ஐ கண்டுபிடிப்போம்.",
            )}
          </p>
        </div>

        <div className={styles.panel}>
          <a className={`${ui.button} ${ui.whatsapp} ${styles.primary}`} href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={22} />
            <span lang="ta">{keepSuffix("WhatsApp-ல் பேசலாம்")}</span>
          </a>

          <ul className={styles.channels}>
            <li>
              <a href={`tel:${CONTACT.phoneE164}`}>
                <span className={styles.channelIcon}>
                  <Icon name="phone" size={20} />
                </span>
                <span>
                  <small>Call us</small>
                  {CONTACT.phoneDisplay}
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`}>
                <span className={styles.channelIcon}>
                  <Icon name="mail" size={20} />
                </span>
                <span>
                  <small>Email us</small>
                  {CONTACT.email}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
