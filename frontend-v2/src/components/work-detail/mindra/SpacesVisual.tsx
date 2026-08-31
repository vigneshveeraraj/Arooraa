import { SPACES, SPACES_PRINCIPLE } from "@/lib/content/work-detail/mindra";
import styles from "./SpacesVisual.module.css";

/**
 * Chapter 3 — one of the largest editorial visuals on the page. The
 * supplied concept image shows Private / Today / Family across mobile and
 * web; it is never left to stand alone — the My Space / Family Space
 * distinction and the sharing principle render as real text directly
 * beside it. The one card in the source image that named a fictitious
 * contact and phone number was replaced with a neutral placeholder before
 * this asset ever reached this component (see image-processing notes).
 */
export function SpacesVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <img
          src="/images/work/mindra/story/private-today-family.webp"
          alt="Concept illustration of Mindra showing Private, Today and Family spaces across mobile and web, with personal and shared family information kept visually distinct."
          width={1448}
          height={1086}
          className={styles.image}
          loading="lazy"
        />
        <figcaption className={styles.caption}>Concept illustration — Private, Today and Family, across mobile and web.</figcaption>
      </figure>

      <div className={styles.spaces}>
        {SPACES.map((space) => (
          <div key={space.name} className={styles.space}>
            <p className={styles.spaceName}>{space.name}</p>
            <p className={styles.spaceDescription}>{space.description}</p>
          </div>
        ))}
      </div>

      <p className={styles.principle}>{SPACES_PRINCIPLE}</p>
    </div>
  );
}
