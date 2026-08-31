import styles from "./SmartMirrorHeroVisual.module.css";

/**
 * The Smart Mirror story's hero — the strongest supplied home/morning
 * scene, given cinematic presence (large, uncropped, no small-card
 * treatment) rather than shrunk into a feature card. The reflection stays
 * the dominant visual element; the mirror's own on-glass panel shows
 * restrained ambient context, not a dashboard. This is the one supplied
 * home scene, so Chapter 03 (Home) tells its part of the story natively,
 * without a second home photograph.
 *
 * W2.3A — the caption moved from a plain line beneath the image into a
 * small overlay badge on the image itself (editorial photo-credit
 * convention), for a more premium opening and less trailing vertical
 * space beneath the hero visual.
 */
export function SmartMirrorHeroVisual() {
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <img
          src="/images/work/smart-mirror/story/home-morning.webp"
          alt="Concept illustration of a person naturally glancing at a smart mirror during their morning routine, with restrained ambient information beside their reflection."
          width={768}
          height={512}
          className={styles.image}
          loading="eager"
        />
        <figcaption className={styles.caption}>Home experience — concept illustration</figcaption>
      </div>
    </figure>
  );
}
