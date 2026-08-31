import { INTELLIGENCE_FINAL_NOTE, INTELLIGENCE_ITEMS, INTELLIGENCE_KEY_LINE, INTELLIGENCE_STAGES } from "@/lib/content/work-detail/smart-home";
import { HouseIcon, ObservationIcon } from "./SmartHomeIcons";
import styles from "./IntelligenceVisual.module.css";

const ICONS = [HouseIcon, ObservationIcon];

/**
 * Chapter 11 — a simple three-stage flow (Reliable Home → Observations →
 * Suggestions), deliberately not an AI-brain graphic: the third stage is
 * a plain list of what suggestions could help with, ending on a person
 * icon and the explicit "human remains the final decision point" line.
 */
export function IntelligenceVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.flow}>
        {INTELLIGENCE_STAGES.slice(0, 2).map((stage, index) => (
          <div key={stage} className={styles.stageWrap}>
            {index > 0 ? <span className={styles.arrow} aria-hidden="true" /> : null}
            <div className={styles.stage}>
              <span className={styles.stageIcon} aria-hidden="true">
                {(() => {
                  const Icon = ICONS[index]!;
                  return <Icon />;
                })()}
              </span>
              <span className={styles.stageName}>{stage}</span>
            </div>
          </div>
        ))}
        <span className={styles.arrow} aria-hidden="true" />
        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>{INTELLIGENCE_STAGES[2]}</p>
          <ul className={styles.suggestionsList}>
            {INTELLIGENCE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.keyLine}>{INTELLIGENCE_KEY_LINE}</p>
      <p className={styles.finalNote}>{INTELLIGENCE_FINAL_NOTE}</p>
    </div>
  );
}
