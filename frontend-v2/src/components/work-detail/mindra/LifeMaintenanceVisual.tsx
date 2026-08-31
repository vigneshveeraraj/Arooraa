import {
  INSURANCE_FUTURE_DIRECTION,
  LIFE_MAINTENANCE_PRINCIPLE,
  MAINTENANCE_CONCEPT_LABEL,
  MAINTENANCE_GROUPS,
  SERVICE_CONTACT_FUTURE_DIRECTION,
} from "@/lib/content/work-detail/mindra";
import styles from "./LifeMaintenanceVisual.module.css";

/**
 * Chapter 7 — the life-maintenance concept image, clearly labeled as
 * concept direction (its own reminders — day-counts on a single example
 * item — are illustrative, not real usage data; the source image's own
 * fabricated aggregate stats, "3 Due Soon / 2 This Week / 8 Upcoming" and
 * "5 tasks completed this month", were removed before this asset shipped —
 * see image-processing notes), followed by the four grouped categories as
 * real text, the guiding principle, and careful, explicit future-direction
 * wording for insurance comparison and service-provider contact info.
 */
export function LifeMaintenanceVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{MAINTENANCE_CONCEPT_LABEL}</span>
        <img
          src="/images/work/mindra/story/life-maintenance.webp"
          alt="Concept illustration of Mindra surfacing recurring maintenance reminders such as an insurance renewal, vehicle service and personal-care routines."
          width={968}
          height={1086}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <p className={styles.principle}>{LIFE_MAINTENANCE_PRINCIPLE}</p>

      <div className={styles.groups}>
        {MAINTENANCE_GROUPS.map((group) => (
          <div key={group.name} className={styles.group}>
            <p className={styles.groupName}>{group.name}</p>
            <ul className={styles.groupItems}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.futureNotes}>
        <p>{INSURANCE_FUTURE_DIRECTION}</p>
        <p>{SERVICE_CONTACT_FUTURE_DIRECTION}</p>
      </div>
    </div>
  );
}
