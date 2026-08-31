import styles from "./AboutHeroVisual.module.css";

const SPARK_PATH =
  "M12 1 C12.9 7.1 16.9 11.1 23 12 C16.9 12.9 12.9 16.9 12 23 C11.1 16.9 7.1 12.9 1 12 C7.1 11.1 11.1 7.1 12 1 Z";

/**
 * The About hero's signature "problem → observation → idea → clarity →
 * product" scene (W3.1 §4): dashed, muted loops on the left (recurring
 * frustration) converge on one bright junction, which then resolves into
 * clean, solid product shapes on the right. Purely decorative — the hero's
 * real headline/supporting copy already carries the meaning in text.
 */
export function AboutHeroVisual() {
  return (
    <div className={styles.frame}>
      <svg viewBox="0 0 640 480" aria-hidden="true" className={styles.scene}>
        <defs>
          <radialGradient id="about-hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Repeated friction — dashed, muted loops */}
        <circle cx="112" cy="120" r="46" className={styles.loop} />
        <path d="M150 96 l10 -6 l-2 12 Z" className={styles.loopArrow} />
        <circle cx="82" cy="258" r="34" className={styles.loop} />
        <path d="M110 240 l9 -5 l-2 11 Z" className={styles.loopArrow} />
        <circle cx="152" cy="366" r="38" className={styles.loopSecondary} />

        {/* Scattered problem notes */}
        <rect x="196" y="86" width="30" height="20" rx="3" className={styles.note} />
        <rect x="40" y="188" width="34" height="22" rx="3" className={styles.note} />
        <line x1="204" y1="94" x2="220" y2="94" className={styles.noteMark} />
        <line x1="204" y1="100" x2="216" y2="100" className={styles.noteMark} />

        {/* Convergence glow */}
        <circle cx="392" cy="222" r="130" fill="url(#about-hero-glow)" />

        {/* Lines sharpening toward the bright junction */}
        <path d="M150 128 C 230 150, 300 190, 380 216" className={styles.converge} />
        <path d="M112 230 C 200 230, 300 220, 380 222" className={styles.converge} />
        <path d="M170 350 C 250 320, 320 270, 384 228" className={styles.converge} />

        {/* The bright junction — the AROORAA Spark */}
        <path
          d={SPARK_PATH}
          transform="translate(360,190) scale(1.9)"
          className={styles.spark}
        />

        {/* Product Direction — clean, solid, connected shapes */}
        <line x1="404" y1="220" x2="458" y2="176" className={styles.resolve} />
        <line x1="404" y1="222" x2="466" y2="258" className={styles.resolve} />
        <line x1="400" y1="230" x2="440" y2="332" className={styles.resolve} />

        <rect x="460" y="132" width="112" height="72" rx="14" className={styles.productElectric} />
        <rect x="466" y="226" width="94" height="60" rx="14" className={styles.productCyan} />
        <rect x="436" y="308" width="102" height="64" rx="14" className={styles.productAmber} />
      </svg>
    </div>
  );
}
