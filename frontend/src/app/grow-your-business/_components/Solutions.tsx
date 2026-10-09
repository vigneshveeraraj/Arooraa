import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";
import { FEATURED_SERVICE, SERVICES } from "./content";
import styles from "./Solutions.module.css";
import ui from "./ui.module.css";

export function Solutions() {
  return (
    <section id="solutions" className={ui.section} aria-labelledby="solutions-title">
      <div className={ui.shell}>
        <SectionHeading
          id="solutions-title"
          eyebrow="Our Solutions"
          title="Website மட்டும் இல்லை — முழுமையான Digital Solutions"
          lead="Website முதல் AI & Automation வரை, உங்கள் business-க்கு தேவையான technology solutions ஒரே இடத்தில்."
          lang="ta"
        />

        <div className={styles.grid}>
          <article className={styles.featured}>
            <div className={styles.featuredHead}>
              <span className={styles.featuredIcon}>
                <Icon name={FEATURED_SERVICE.icon} size={28} />
              </span>
              <span className={styles.featuredTag}>Core service</span>
            </div>
            <h3>{FEATURED_SERVICE.title}</h3>
            <p lang="ta">{FEATURED_SERVICE.description}</p>
            <ul className={styles.points}>
              {FEATURED_SERVICE.points.map((point) => (
                <li key={point}>
                  <Icon name="check" size={18} />
                  {point}
                </li>
              ))}
            </ul>
          </article>

          {SERVICES.map((service) => (
            <article key={service.title} className={styles.card}>
              <span className={ui.iconTile}>
                <Icon name={service.icon} />
              </span>
              <h3>{service.title}</h3>
              <p lang="ta">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
