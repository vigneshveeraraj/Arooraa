import { GYM_CONCEPT_ITEMS, GYM_CONCEPT_LABEL, GYM_FUTURE_DIRECTION } from "@/lib/content/work-detail/smart-mirror";
import styles from "./GymConceptVisual.module.css";

/**
 * Chapter 4 — the gym/fitness concept image, clearly labeled as an
 * experience concept, full-bleed for cinematic presence (the brief asks
 * for a full-width gym image in the rhythm). The garbled "Weinght" label
 * baked into the source image was corrected before shipping — see
 * image-processing notes; the weight/BMI figures themselves are kept as
 * illustrative mock data, per the brief. Followed by the real concept item
 * list and the explicit, careful future-direction / no-medical-claim wording.
 */
export function GymConceptVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{GYM_CONCEPT_LABEL}</span>
        <img
          src="/images/work/smart-mirror/story/gym-fitness.webp"
          alt="Concept illustration of a smart mirror in a modern gym displaying glanceable, illustrative fitness information beside a person's reflection."
          width={768}
          height={512}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <ul className={styles.items}>
        {GYM_CONCEPT_ITEMS.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>

      <p className={styles.futureNote}>{GYM_FUTURE_DIRECTION}</p>
    </div>
  );
}
