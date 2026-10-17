import { CONTRAST } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import styles from "./CampaignContrast.module.css";

/** "Your business today" vs "With AROORAA" — one two-tone panel. */
export function CampaignContrast() {
  const { today, withArooraa } = CONTRAST;
  return (
    <section className={styles.section} aria-label="Your business today, and with AROORAA">
      <div className={styles.panel}>
        <div className={styles.today}>
          <p className={styles.eyebrow}>{today.eyebrow}</p>
          <h2 lang="ta">{today.title}</h2>
          <ul lang="ta">
            {today.items.map((item) => (
              <li key={item}>
                <span className={styles.mark}>
                  <CampaignIcon name="x" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.with}>
          <p className={styles.eyebrow}>{withArooraa.eyebrow}</p>
          <h2 lang="ta">{withArooraa.title}</h2>
          <ul>
            {withArooraa.items.map((item) => (
              <li key={item}>
                <span className={styles.mark}>
                  <CampaignIcon name="check" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
