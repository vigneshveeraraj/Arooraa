import { EDGE_EXTERNAL_CONTEXT, EDGE_FRAMING, EDGE_STAGES } from "@/lib/content/work-detail/smart-mirror";
import { ChipIcon, FrameIcon, MirrorIcon } from "./SmartMirrorIcons";
import styles from "./EdgeFoundationVisual.module.css";

const ICONS = [MirrorIcon, ChipIcon, FrameIcon];

/**
 * Chapter 11 — a simple linear sequence (Mirror Experience → Local Product
 * Runtime → Physical Environment), not an internal topology diagram.
 * External/cloud context renders once, faint and to the side, clearly
 * optional and supporting rather than central to the composition.
 */
export function EdgeFoundationVisual() {
  return (
    <div className={styles.wrapper}>
      <ol className={styles.stack}>
        {EDGE_STAGES.map((stage, index) => {
          const Icon = ICONS[index] ?? MirrorIcon;
          return (
            <li key={stage} className={styles.stage}>
              {index > 0 ? <span className={styles.connector} aria-hidden="true" /> : null}
              <span className={styles.stageIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.stageName}>{stage}</span>
            </li>
          );
        })}
      </ol>

      <p className={styles.external}>{EDGE_EXTERNAL_CONTEXT}</p>

      <p className={styles.framing}>{EDGE_FRAMING}</p>
    </div>
  );
}
