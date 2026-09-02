import styles from "./AuraVoiceCue.module.css";

/**
 * The one line that tells a visitor they can speak, and in which languages.
 *
 * <p>Named languages rather than a claim of universal support: English, Tamil and Tanglish are
 * what Aura has actually been built and tested for, and Tamil is written in Tamil because a Tamil
 * speaker should be able to see that at a glance rather than read an English word for it.
 *
 * <p>No flag, and no globe. A flag maps a language to a country, which is wrong for Tamil in
 * particular and slightly wrong for every language; a globe emoji is a generic control-panel
 * gesture that says nothing about speaking. The mark instead borrows the Spark's own geometry —
 * the tilted rounded-square core, and bars whose opacity descends exactly as the Spark's rays do —
 * so it reads as Aura's own voice rather than as an internationalisation setting.
 */
export function AuraVoiceCue({ className }: { className?: string }) {
  return (
    <p className={[styles.cue, className].filter(Boolean).join(" ")}>
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 24 16" width="100%" height="100%" focusable="false">
          {/* The Spark's core, at the head of the utterance. */}
          <rect className={styles.core} x="1.6" y="5.6" width="4.8" height="4.8" rx="1.5"
                transform="rotate(45 4 8)" />
          {/* Three bars rising away from it — speech leaving, not a level meter reading. */}
          <rect className={styles.barSmall} x="11" y="5.5" width="2" height="5" rx="1" />
          <rect className={styles.barMedium} x="15" y="3.5" width="2" height="9" rx="1" />
          <rect className={styles.barTall} x="19" y="1.5" width="2" height="13" rx="1" />
        </svg>
      </span>
      <span>
        Speak naturally — English · <span lang="ta">தமிழ்</span> · Tanglish
      </span>
    </p>
  );
}
