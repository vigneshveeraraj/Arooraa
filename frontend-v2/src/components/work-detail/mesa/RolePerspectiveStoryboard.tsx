import { ROLE_PERSPECTIVES } from "@/lib/content/work-detail/mesa";
import { CallWaiterIcon, MenuIcon, OrderIcon, PlayIcon, QrIcon } from "./JourneyIcons";
import styles from "./RolePerspectiveStoryboard.module.css";

const PANEL_IMAGES = [
  {
    src: "/images/work/mesa/story/role-guest.webp",
    width: 836,
    height: 470,
    alt: "Concept visualization of a guest reviewing the menu in the dining room.",
  },
  {
    src: "/images/work/mesa/story/role-waiter.webp",
    width: 836,
    height: 470,
    alt: "Concept visualization of a waiter reviewing an order for a table.",
  },
  {
    src: "/images/work/mesa/story/role-kitchen.webp",
    width: 836,
    height: 471,
    alt: "Concept visualization of kitchen staff preparing an order.",
  },
  {
    src: "/images/work/mesa/story/role-owner.webp",
    width: 836,
    height: 471,
    alt: "Concept visualization of a restaurant owner reviewing the operation.",
  },
];

const GUEST_JOURNEY_CUE = [
  { Icon: QrIcon, label: "Scan" },
  { Icon: MenuIcon, label: "Browse" },
  { Icon: OrderIcon, label: "Order" },
  { Icon: PlayIcon, label: "Wait / Play" },
];

/**
 * Chapter 4 — the same restaurant moment through four perspectives.
 * W2.1.2B correction: the guest photo shows a physical menu, which reads
 * as general restaurant atmosphere, not the MESA ordering mechanism — so
 * the guest panel now carries a small real-HTML journey cue (Scan, Browse,
 * Order, Wait / Play) making the actual mobile-first path explicit rather
 * than relying on the photo. The waiter panel gets a small editorial
 * status chip ("TABLE REQUEST") showing the conceptual service-call
 * moment — not a fake production UI, just a simple state label. Kitchen
 * and Owner/Manager stay as delivered in W2.1.2 (kept high-level and
 * public-safe; the owner photo's generated dashboard numbers stay masked).
 */
export function RolePerspectiveStoryboard() {
  return (
    <div>
      <div className={styles.grid}>
        {ROLE_PERSPECTIVES.map((perspective, index) => {
          const image = PANEL_IMAGES[index];
          if (!image) return null;
          return (
            <article key={perspective.role} className={styles.panel}>
              <div className={styles.imageFrame}>
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className={styles.image}
                  loading="lazy"
                />
                {perspective.role === "Restaurant Owner / Manager" ? <span className={styles.metricMask} aria-hidden="true" /> : null}
              </div>
              <h3 className={`text-h4 ${styles.role}`}>{perspective.role}</h3>
              <p className={styles.quote}>&ldquo;{perspective.quote}&rdquo;</p>

              {perspective.role === "Guest" ? (
                <ol className={styles.journeyCue} aria-label="The guest's mobile-first table journey">
                  {GUEST_JOURNEY_CUE.map(({ Icon, label }, cueIndex) => (
                    <li key={label} className={styles.cueStep}>
                      {cueIndex > 0 ? (
                        <span className={styles.cueArrow} aria-hidden="true">
                          →
                        </span>
                      ) : null}
                      <span className={styles.cueIcon}>
                        <Icon />
                      </span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ol>
              ) : null}

              {perspective.role === "Waiter / Service Team" ? (
                <p className={styles.statusChip}>
                  <span className={styles.statusIcon}>
                    <CallWaiterIcon />
                  </span>
                  <span>Table Request</span>
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
      <p className={styles.caption}>Concept visualization — how different roles experience the same restaurant moment.</p>
    </div>
  );
}
