import { Icon } from "./Icon";
import { TODAY_PROBLEMS, WITH_AROORAA } from "./content";
import { keepSuffix } from "./keepSuffix";
import styles from "./Comparison.module.css";
import ui from "./ui.module.css";

/** "Your business today" vs "With AROORAA" — two side-by-side panels. */
export function Comparison() {
  return (
    <section className={`${ui.section} ${ui.tinted}`} aria-label="Your business today and with AROORAA">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={`${styles.panel} ${styles.today}`}>
          <p className={ui.eyebrow}>Your business today</p>
          <h2 className={styles.title} lang="ta">
            இன்னும் இப்படித்தான் manage பண்றீங்களா?
          </h2>
          <ul className={styles.list}>
            {TODAY_PROBLEMS.map((item) => (
              <li key={item} lang="ta">
                <span className={`${styles.mark} ${styles.markX}`}>
                  <Icon name="x" size={14} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.panel} ${styles.with}`}>
          <p className={ui.eyebrow}>With AROORAA</p>
          <h2 className={styles.title} lang="ta">
            {keepSuffix("உங்கள் Business-க்கு சரியான Digital Solution")}
          </h2>
          <ul className={styles.list}>
            {WITH_AROORAA.map((item) => (
              <li key={item}>
                <span className={`${styles.mark} ${styles.markCheck}`}>
                  <Icon name="check" size={14} />
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
