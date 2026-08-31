import { HOME_STATES, NORMAL_HOME_KEY_LINE } from "@/lib/content/work-detail/smart-home";
import { CheckIcon, CloudIcon, HouseIcon } from "./SmartHomeIcons";
import styles from "./NormalHomeStatesVisual.module.css";

const STATE_CLASS = ["normal", "assist", "offline"] as const;

/**
 * Chapter 2 — three equally substantial house states, not a hierarchy:
 * Normal Home stays plain, Smart Assist adds one quiet accent cue, and
 * Offline / Local Continuity shows a crossed-out cloud with a "Local"
 * badge to make the continuity principle visible, not just stated.
 */
export function NormalHomeStatesVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.states}>
        {HOME_STATES.map((state, index) => {
          const cls = STATE_CLASS[index] ?? "normal";
          return (
            <div key={state.name} className={styles.state}>
              <div className={`${styles.card} ${styles[cls]}`} aria-hidden="true">
                <span className={styles.houseIcon}>
                  <HouseIcon />
                </span>
                {cls === "assist" ? (
                  <span className={styles.assistBadge}>
                    <CheckIcon />
                  </span>
                ) : null}
                {cls === "offline" ? (
                  <span className={styles.offlineBadge}>
                    <span className={styles.cloudIcon}>
                      <CloudIcon />
                    </span>
                    <span className={styles.cloudSlash} />
                    <span className={styles.localTag}>Local</span>
                  </span>
                ) : null}
              </div>
              <p className={styles.stateName}>{state.name}</p>
              <p className={styles.stateDescription}>{state.description}</p>
            </div>
          );
        })}
      </div>

      <p className={styles.keyLine}>{NORMAL_HOME_KEY_LINE}</p>
    </div>
  );
}
