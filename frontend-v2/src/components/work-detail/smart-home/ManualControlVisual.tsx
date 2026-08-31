import { MANUAL_CONTROL_CONCEPT_LABEL, MANUAL_CONTROL_ITEMS, MANUAL_CONTROL_KEY_LINE } from "@/lib/content/work-detail/smart-home";
import styles from "./ManualControlVisual.module.css";

/**
 * Chapter 6 — the manual-control lifestyle image, with the source
 * image's own baked marketing headline ("Smart when helpful. Manual when
 * needed." plus a supporting paragraph) removed before shipping, since
 * this chapter's real heading and key line already carry that message as
 * editable HTML text — see image-processing notes.
 */
export function ManualControlVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{MANUAL_CONTROL_CONCEPT_LABEL}</span>
        <img
          src="/images/work/smart-home/story/manual-control.webp"
          alt="Concept illustration of a person using a normal physical light switch beside a smart wall panel showing the same status."
          width={1448}
          height={1086}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <p className={styles.keyLine}>{MANUAL_CONTROL_KEY_LINE}</p>

      <ul className={styles.items}>
        {MANUAL_CONTROL_ITEMS.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
