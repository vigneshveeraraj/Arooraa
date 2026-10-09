import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";
import { VALUES } from "./content";
import styles from "./WhyArooraa.module.css";
import ui from "./ui.module.css";

export function WhyArooraa() {
  return (
    <section id="why-arooraa" className={ui.section} aria-labelledby="why-title">
      <div className={ui.shell}>
        <SectionHeading
          id="why-title"
          eyebrow="Why AROORAA"
          title="Website மட்டும் இல்லை, ஒரு Technology Partner"
          lang="ta"
          centered
        />

        <ul className={styles.grid}>
          {VALUES.map((value) => (
            <li key={value.title} className={styles.card}>
              <span className={ui.iconTile}>
                <Icon name={value.icon} />
              </span>
              <h3>{value.title}</h3>
              <p lang="ta">{value.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
