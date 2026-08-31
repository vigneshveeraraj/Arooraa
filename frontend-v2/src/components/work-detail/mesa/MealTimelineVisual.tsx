import { MEAL_TIMELINE_STAGES } from "@/lib/content/work-detail/mesa";
import styles from "./MealTimelineVisual.module.css";

const FRAME_PHOTOS = [
  { src: "/images/work/mesa/story/meal-01.webp", alt: "Guest and waiter at the table." },
  { src: "/images/work/mesa/story/meal-02.webp", alt: "Guest browsing the menu." },
  { src: "/images/work/mesa/story/meal-03.webp", alt: "Waiter noting the order at the table." },
  { src: "/images/work/mesa/story/meal-04.webp", alt: "Guests waiting together at the table." },
  { src: "/images/work/mesa/story/meal-05.webp", alt: "Kitchen staff preparing a dish." },
  { src: "/images/work/mesa/story/meal-06.webp", alt: "Waiter serving food to the table." },
  { src: "/images/work/mesa/story/meal-07.webp", alt: "Guests enjoying their meal." },
  { src: "/images/work/mesa/story/meal-08.webp", alt: "Waiter completing the bill at the table." },
];

/**
 * Chapter 6 — rebuilt W2.1.2C. The earlier wide composite plus a separate
 * long vertical timeline duplicated the same eight moments twice and left
 * the composite's own eight blur patches visibly obvious. This version
 * uses eight individually cropped, clean storyboard photos (the composite
 * split into frames, with the baked — and by now mismatched — stage badge
 * cropped out of each one entirely, not blurred) as the chapter's one
 * storyboard: a compact 4x2 editorial grid at desktop, one frame at a time
 * down the page at mobile. Each frame pairs its photo directly with the
 * approved stage number, label and one-line description as real text.
 */
export function MealTimelineVisual() {
  return (
    <ol className={styles.storyboard} aria-label="The eight stages of a MESA-supported meal">
      {MEAL_TIMELINE_STAGES.map((stage, index) => {
        const photo = FRAME_PHOTOS[index];
        if (!photo) return null;
        return (
          <li key={stage.label} className={styles.frame}>
            <div className={styles.imageFrame}>
              <img src={photo.src} alt={photo.alt} width={386} height={252} className={styles.image} loading="lazy" />
            </div>
            <div className={styles.frameBody}>
              <p className={styles.frameNumber}>{String(index + 1).padStart(2, "0")}</p>
              <p className={styles.frameLabel}>{stage.label}</p>
              <p className={styles.frameDescription}>{stage.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
