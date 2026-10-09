import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";
import { INDUSTRIES } from "./content";
import styles from "./Industries.module.css";
import ui from "./ui.module.css";

export function Industries() {
  return (
    <section id="industries" className={`${ui.section} ${ui.tinted}`} aria-labelledby="industries-title">
      <div className={ui.shell}>
        <SectionHeading
          id="industries-title"
          eyebrow="For Businesses Like Yours"
          title="உங்கள் Business-க்கு ஏற்றபடி"
          lead="இவை சில உதாரணங்கள் மட்டுமே — உங்கள் business எதுவாக இருந்தாலும் பேசலாம்."
          lang="ta"
        />

        <ul className={styles.grid}>
          {INDUSTRIES.map((industry) => (
            <li key={industry.name} className={styles.card}>
              <span className={ui.iconTile}>
                <Icon name={industry.icon} />
              </span>
              <div>
                <h3>{industry.name}</h3>
                <p>{industry.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
