import { MOBILE_USES, MOBILE_WEB_PRINCIPLE, WEB_USES } from "@/lib/content/work-detail/mindra";
import styles from "./MobileWebVisual.module.css";

/**
 * Chapter 8 — the mobile + web continuity image, full width, followed by
 * two plain columns of real text (no claim of offline synchronization —
 * only that the same memory is available across devices) and the
 * chapter's own principle line.
 */
export function MobileWebVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <img
          src="/images/work/mindra/story/mobile-web.webp"
          alt="Concept illustration of Mindra's personal information moving between a phone and a laptop, available across mobile and web."
          width={1448}
          height={1086}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <p className={styles.principle}>{MOBILE_WEB_PRINCIPLE}</p>

      <div className={styles.columns}>
        <div className={styles.column}>
          <p className={styles.columnName}>Mobile</p>
          <ul className={styles.columnList}>
            {MOBILE_USES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.column}>
          <p className={styles.columnName}>Web</p>
          <ul className={styles.columnList}>
            {WEB_USES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
