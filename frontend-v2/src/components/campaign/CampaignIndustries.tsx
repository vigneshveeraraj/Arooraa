import { INDUSTRIES } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import { CampaignSectionHeader } from "./CampaignSectionHeader";
import styles from "./CampaignIndustries.module.css";

/** Industry examples as one divided panel rather than six separate cards. */
export function CampaignIndustries() {
  return (
    <section id="industries" className={styles.section} aria-labelledby="industries-title">
      <div className={styles.inner}>
        <CampaignSectionHeader id="industries-title" eyebrow={INDUSTRIES.eyebrow} title={INDUSTRIES.title} lead={INDUSTRIES.lead} />
        <ul className={styles.panel}>
          {INDUSTRIES.items.map((industry) => (
            <li key={industry.name}>
              <span className={styles.icon}>
                <CampaignIcon name={industry.icon} />
              </span>
              <span>
                <b>{industry.name}</b>
                {industry.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
