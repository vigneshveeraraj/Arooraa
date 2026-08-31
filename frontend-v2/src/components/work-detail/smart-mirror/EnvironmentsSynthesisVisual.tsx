import { ENVIRONMENT_CUES, ENVIRONMENTS } from "@/lib/content/work-detail/smart-mirror";
import { DumbbellIcon, FamilyIcon, ScissorsIcon, WelcomeIcon } from "./SmartMirrorIcons";
import styles from "./EnvironmentsSynthesisVisual.module.css";

const ICONS = { Home: FamilyIcon, Fitness: DumbbellIcon, Salon: ScissorsIcon, Hospitality: WelcomeIcon } as const;

/**
 * Chapter 7 — deliberately not another radial ecosystem diagram: four
 * differently tinted environment strips side by side, with one shared,
 * translucent mirror silhouette overlaid across all four, reading as the
 * same object passing through every scene rather than four separate
 * products or a hub-and-spoke system.
 */
export function EnvironmentsSynthesisVisual() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.mirrorSilhouette} aria-hidden="true" />
      {ENVIRONMENTS.map((name) => {
        const Icon = ICONS[name as keyof typeof ICONS];
        return (
          <div key={name} className={`${styles.strip} ${styles[name.toLowerCase()]}`}>
            <span className={styles.stripIcon} aria-hidden="true">
              <Icon />
            </span>
            <p className={styles.stripLabel}>{name}</p>
            <p className={styles.stripCue}>{ENVIRONMENT_CUES[name]}</p>
          </div>
        );
      })}
    </div>
  );
}
