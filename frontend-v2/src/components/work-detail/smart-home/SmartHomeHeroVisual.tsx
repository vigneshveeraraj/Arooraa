import styles from "./SmartHomeHeroVisual.module.css";

/**
 * The Smart Home story's hero — the supplied whole-home context scene,
 * given cinematic presence (large, uncropped) rather than shrunk into a
 * small card. The garbled overlapping "21.6° / Comfort" text and the
 * specific kWh/percentage energy readout baked into the source image were
 * cleaned before shipping — see image-processing notes.
 */
export function SmartHomeHeroVisual() {
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <img
          src="/images/work/smart-home/story/hero.webp"
          alt="Concept illustration of a family in a warm, modern living space with restrained ambient home context beside them."
          width={1448}
          height={1086}
          className={styles.image}
          loading="eager"
        />
        <figcaption className={styles.caption}>Whole-home experience — concept illustration</figcaption>
      </div>
    </figure>
  );
}
