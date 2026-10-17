import { SOLUTIONS } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import { CampaignSectionHeader } from "./CampaignSectionHeader";
import styles from "./CampaignSolutions.module.css";

/** Website development as the featured offer, the supporting services as an editorial list. */
export function CampaignSolutions() {
  const { featured, services } = SOLUTIONS;
  return (
    <section id="solutions" className={styles.section} aria-labelledby="solutions-title">
      <div className={styles.inner}>
        <CampaignSectionHeader id="solutions-title" eyebrow={SOLUTIONS.eyebrow} title={SOLUTIONS.title} lead={SOLUTIONS.lead} />
        <div className={styles.layout}>
          <article className={styles.featured}>
            <span className={styles.tag}>{featured.tag}</span>
            <h3>{featured.title}</h3>
            <p lang="ta">{featured.description}</p>
            <ul>
              {featured.points.map((point) => (
                <li key={point}>
                  <CampaignIcon name="check" className={styles.pointIcon} />
                  {point}
                </li>
              ))}
            </ul>
            <div className={styles.thumbs} aria-hidden="true">
              <img src="/images/campaign/maram-living/living-room.webp" alt="" width={960} height={640} loading="lazy" decoding="async" />
              <img src="/images/campaign/forgeline/welding.webp" alt="" width={960} height={540} loading="lazy" decoding="async" />
            </div>
          </article>

          <ol className={styles.list}>
            {services.map((service, index) => (
              <li key={service.title}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.icon}>
                  <CampaignIcon name={service.icon} />
                </span>
                <div>
                  <h3>{service.title}</h3>
                  <p lang="ta">{service.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
