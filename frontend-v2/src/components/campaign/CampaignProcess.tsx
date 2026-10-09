import { PROCESS } from "@/lib/content/grow-your-business";
import { CampaignSectionHeader } from "./CampaignSectionHeader";
import styles from "./CampaignProcess.module.css";

/** Four engagement steps as an editorial timeline. */
export function CampaignProcess() {
  return (
    <section id="process" className={styles.section} aria-labelledby="process-title">
      <div className={styles.inner}>
        <CampaignSectionHeader id="process-title" eyebrow={PROCESS.eyebrow} title={PROCESS.title} lead={PROCESS.lead} />
        <ol className={styles.timeline}>
          {PROCESS.steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 lang={step.titleLang}>{step.title}</h3>
              <p lang="ta">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
