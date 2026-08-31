import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { PRIVACY_PRINCIPLES } from "@/lib/content/work-detail/smart-mirror";
import styles from "./PrivacyBoundaryVisual.module.css";

const VIEW_W = 420;
const VIEW_H = 300;

/**
 * Chapter 12 — a person and a mirror inside a private home boundary, with
 * one small, faint external-context marker outside it — deliberately not
 * a giant lock, a CCTV icon or a cloud-logo diagram. The boundary itself
 * carries the meaning (private inside, optional/supporting outside); the
 * six trust principles render beneath as real, visible text.
 */
export function PrivacyBoundaryVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scene}>
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
          <rect className={styles.boundary} x="26" y="18" width="304" height="264" rx="26" />
          <rect className={styles.mirrorShape} x="222" y="105" width="66" height="98" rx="14" />
          <line className={styles.mirrorSheen} x1="236" y1="118" x2="236" y2="180" />
          <circle className={styles.external} cx="378" cy="48" r="20" />
          <EditorialFigure x={150} y={240} scale={1.55} />
        </svg>
      </div>

      <ul className={styles.principles}>
        {PRIVACY_PRINCIPLES.map((principle) => (
          <li key={principle} className={styles.principle}>
            {principle}
          </li>
        ))}
      </ul>
    </div>
  );
}
