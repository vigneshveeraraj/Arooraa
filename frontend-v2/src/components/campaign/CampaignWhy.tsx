import { WHY_AROORAA } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import { CampaignSectionHeader } from "./CampaignSectionHeader";
import styles from "./CampaignWhy.module.css";

export function CampaignWhy() {
  return (
    <section id="why-arooraa" className={styles.section} aria-labelledby="why-title">
      <div className={styles.inner}>
        <CampaignSectionHeader id="why-title" eyebrow={WHY_AROORAA.eyebrow} title={WHY_AROORAA.title} />
        <ul className={styles.values}>
          {WHY_AROORAA.values.map((value) => (
            <li key={value.title}>
              <CampaignIcon name={value.icon} className={styles.icon} />
              <h3>{value.title}</h3>
              <p lang="ta">{value.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
