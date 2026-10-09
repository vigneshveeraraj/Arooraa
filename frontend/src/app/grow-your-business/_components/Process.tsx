import { SectionHeading } from "./SectionHeading";
import { STEPS } from "./content";
import styles from "./Process.module.css";
import ui from "./ui.module.css";

export function Process() {
  return (
    <section id="process" className={ui.section} aria-labelledby="process-title">
      <div className={ui.shell}>
        <SectionHeading
          id="process-title"
          eyebrow="How It Works"
          title="Enquiry முதல் Launch வரை"
          lead="ஒவ்வொரு step-லும் உங்களுடன் discuss பண்ணி, தெளிவான process-ஓட வேலை செய்கிறோம்."
          lang="ta"
        />

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 lang="ta">{step.title}</h3>
              <p lang="ta">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
