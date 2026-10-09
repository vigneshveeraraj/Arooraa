import Link from "next/link";
import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";
import { SITE_LINKS } from "./content";
import styles from "./ExploreArooraa.module.css";
import ui from "./ui.module.css";

/** One-way bridge to the main English site (the English site never links back here). */
export function ExploreArooraa() {
  return (
    <section className={`${ui.section} ${ui.tinted}`} aria-labelledby="explore-title">
      <div className={ui.shell}>
        <SectionHeading
          id="explore-title"
          eyebrow="Explore AROORAA"
          title="AROORAA பற்றி மேலும் தெரிந்துகொள்ளுங்கள்"
          lead="எங்கள் services, products மற்றும் work பற்றி main website-ல் (English) பார்க்கலாம்."
          lang="ta"
        />

        <ul className={styles.grid}>
          {SITE_LINKS.map((link) => (
            <li key={link.href}>
              <Link prefetch={false} href={link.href} className={styles.card}>
                <span className={ui.iconTile}>
                  <Icon name={link.icon} />
                </span>
                <span className={styles.text}>
                  <strong>{link.label}</strong>
                  <span>{link.description}</span>
                </span>
                <Icon name="arrowUpRight" size={20} className={styles.arrow} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
