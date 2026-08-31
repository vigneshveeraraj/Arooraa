import { PHYSICAL_CONCERNS, PHYSICAL_LAYERS } from "@/lib/content/work-detail/smart-mirror";
import styles from "./PhysicalProductVisual.module.css";

/**
 * Chapter 10 — the exploded hardware concept image, given a large,
 * unhedged treatment (the brief asks for this explicitly). The chapter
 * copy stays strictly at the five public-safe layer names and high-level
 * physical concerns; it never mentions wiring, pinouts, exact electrical
 * design, component identifiers, a bill of materials or manufacturing
 * cost, even though the source photo (a professional studio exploded-view
 * shot) shows generic assembly cabling as part of its composition — see
 * image-processing notes for the judgment call on why the image ships
 * unedited while the copy stays disciplined.
 */
export function PhysicalProductVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <img
          src="/images/work/smart-mirror/story/exploded-engineering.webp"
          alt="Exploded-view concept illustration of the Smart Mirror prototype's five physical layers: reflective acrylic surface, display panel, slim frame, Raspberry Pi 5 edge platform and rear mount."
          width={1400}
          height={1050}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <ul className={styles.layers}>
        {PHYSICAL_LAYERS.map((layer) => (
          <li key={layer} className={styles.layer}>
            {layer}
          </li>
        ))}
      </ul>

      <div className={styles.concerns}>
        <p className={styles.concernsLabel}>High-level physical concerns</p>
        <ul className={styles.concernsList}>
          {PHYSICAL_CONCERNS.map((concern) => (
            <li key={concern}>{concern}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
