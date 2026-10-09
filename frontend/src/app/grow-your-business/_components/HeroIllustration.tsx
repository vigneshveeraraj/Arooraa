import { Icon } from "./Icon";
import { GROWTH_FLOW } from "./content";
import styles from "./HeroIllustration.module.css";

/**
 * Website → Enquiries → AI & Automation → Marketing → Growth, drawn with HTML/CSS and
 * inline SVG only (no images, no numbers). Every piece sits in normal grid flow — the
 * first version absolutely positioned floating chips, which overlapped at every width.
 */
export function HeroIllustration() {
  return (
    <figure className={styles.visual}>
      <div className={styles.browser} aria-hidden="true">
        <div className={styles.browserBar}>
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.address}>
            <Icon name="shield" size={13} />
            yourbusiness.in
          </span>
        </div>

        <div className={styles.page}>
          <div className={styles.siteNav}>
            <span className={styles.siteLogo} />
            <span className={styles.siteLinks}>
              <i />
              <i />
              <i />
            </span>
          </div>

          <div className={styles.siteHero}>
            <div className={styles.siteCopy}>
              <span className={styles.siteTag}>Welcome</span>
              <span className={`${styles.line} ${styles.lineXl}`} />
              <span className={`${styles.line} ${styles.lineLg}`} />
              <span className={`${styles.line} ${styles.lineSm}`} />
              <span className={styles.siteButtons}>
                <span className={styles.siteWhatsapp}>
                  <Icon name="whatsapp" size={12} />
                  WhatsApp
                </span>
                <span className={styles.siteEnquire}>Enquire</span>
              </span>
            </div>
            <div className={styles.siteArt}>
              <svg viewBox="0 0 120 96" role="presentation">
                <defs>
                  <linearGradient id="hero-art-sky" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#dbe8ff" />
                    <stop offset="1" stopColor="#b9d2ff" />
                  </linearGradient>
                </defs>
                <rect width="120" height="96" rx="10" fill="url(#hero-art-sky)" />
                <circle cx="92" cy="24" r="10" fill="#fff" opacity="0.85" />
                <path d="M0 74 34 44l22 20 18-14 46 34v2a10 10 0 0 1-10 10H10A10 10 0 0 1 0 86Z" fill="#3b78e7" opacity="0.85" />
                <path d="M0 82 26 62l26 18 26-16 42 22v0a10 10 0 0 1-10 10H10A10 10 0 0 1 0 86Z" fill="#1f5bd6" />
              </svg>
            </div>
          </div>

          <div className={styles.siteCards}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className={styles.stem} aria-hidden="true" />

      <ol className={styles.flow} aria-label="How a website grows your business">
        {GROWTH_FLOW.map((step) => (
          <li key={step.label} className={styles.step}>
            <span className={styles.stepIcon}>
              <Icon name={step.icon} size={22} />
            </span>
            <strong>{step.label}</strong>
            <small>{step.detail}</small>
          </li>
        ))}
      </ol>

      <figcaption className={styles.srOnly}>
        Illustration: a business website brings in customer enquiries, AI and automation handle replies and
        follow-ups, marketing adds visibility, and the business grows.
      </figcaption>
    </figure>
  );
}
