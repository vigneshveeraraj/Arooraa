import { LOCAL_FIRST_CLOUD_NOTE, LOCAL_FIRST_STAGES } from "@/lib/content/work-detail/smart-home";
import { CloudIcon, GatewayIcon, RoomIcon } from "./SmartHomeIcons";
import styles from "./LocalFirstVisual.module.css";

const ICONS = [RoomIcon, GatewayIcon];

/**
 * Chapter 3 — a simple, substantial linear stack (Rooms/Devices → Local
 * Home Layer), with external/cloud services rendered smaller and faint to
 * the side, clearly secondary rather than a required hop. No MQTT, ports,
 * network topology or internal service names — the local layer stays one
 * abstract, solid block.
 */
export function LocalFirstVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stack}>
        {LOCAL_FIRST_STAGES.slice(0, 2).map((stage, index) => {
          const Icon = ICONS[index]!;
          return (
            <div key={stage} className={styles.stageRow}>
              {index > 0 ? <span className={styles.connector} aria-hidden="true" /> : null}
              <div className={styles.stage}>
                <span className={styles.stageIcon} aria-hidden="true">
                  <Icon />
                </span>
                <span className={styles.stageName}>{stage}</span>
              </div>
            </div>
          );
        })}

        <span className={styles.branchConnector} aria-hidden="true" />

        <div className={styles.cloudStage}>
          <span className={styles.cloudIcon} aria-hidden="true">
            <CloudIcon />
          </span>
          <span className={styles.cloudName}>{LOCAL_FIRST_STAGES[2]}</span>
        </div>
      </div>

      <p className={styles.cloudNote}>{LOCAL_FIRST_CLOUD_NOTE}</p>
    </div>
  );
}
