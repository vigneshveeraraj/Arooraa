import Link from "next/link";
import { CAMPAIGN_SITE_LINKS } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import styles from "./CampaignExplore.module.css";

/** One-way bridge to the main English site — it never links back here. */
export function CampaignExplore() {
  return (
    <section className={styles.section} aria-labelledby="explore-title">
      <div className={styles.inner}>
        <h2 id="explore-title" className={styles.eyebrow}>
          Explore AROORAA
        </h2>
        <ul className={styles.links}>
          {CAMPAIGN_SITE_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} prefetch={false}>
                <span>
                  <b>{link.label}</b>
                  {link.description}
                </span>
                <CampaignIcon name="arrowUpRight" className={styles.icon} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
