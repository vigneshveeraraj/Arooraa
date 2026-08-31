import {
  INSURANCE_FUTURE_DIRECTION,
  MAINTENANCE_FRAMING_NOTE,
  MAINTENANCE_GROUPS,
  RESOURCES_CONCEPT_LABEL,
  RESOURCE_AWARENESS_ITEMS,
  SERVICE_CONTACT_FUTURE_DIRECTION,
} from "@/lib/content/work-detail/smart-home";
import { BikeIcon, GroomingIcon, WrenchIcon } from "./SmartHomeIcons";
import styles from "./HomeResourcesVisual.module.css";

const GROUP_ICONS = { Vehicle: BikeIcon, Home: WrenchIcon, Personal: GroomingIcon } as const;

/**
 * Chapter 7 — the home maintenance / water-awareness concept image
 * (baked marketing headline removed, specific water-tank percentage,
 * volume and "Last updated" timestamp removed — see image-processing
 * notes), followed by the resource-awareness items, the three grouped
 * maintenance categories as real text (already close to the source
 * image's own illustrative reminders), an explicit framing note keeping
 * this distinct from electrical Smart Home functions, and the careful
 * insurance / service-contact future-direction wording.
 */
export function HomeResourcesVisual() {
  return (
    <div className={styles.wrapper}>
      <figure className={styles.figure}>
        <span className={styles.conceptBadge}>{RESOURCES_CONCEPT_LABEL}</span>
        <img
          src="/images/work/smart-home/story/maintenance-water.webp"
          alt="Concept illustration of household resource awareness, including water-tank status and a list of illustrative recurring maintenance reminders."
          width={1448}
          height={1086}
          className={styles.image}
          loading="lazy"
        />
      </figure>

      <ul className={styles.items}>
        {RESOURCE_AWARENESS_ITEMS.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>

      <div className={styles.groups}>
        {MAINTENANCE_GROUPS.map((group) => {
          const Icon = GROUP_ICONS[group.name as keyof typeof GROUP_ICONS];
          return (
            <div key={group.name} className={styles.group}>
              <div className={styles.groupHead}>
                <span className={styles.groupIcon} aria-hidden="true">
                  <Icon />
                </span>
                <p className={styles.groupName}>{group.name}</p>
              </div>
              <ul className={styles.groupItems}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className={styles.framingNote}>{MAINTENANCE_FRAMING_NOTE}</p>

      <div className={styles.futureNotes}>
        <p>{INSURANCE_FUTURE_DIRECTION}</p>
        <p>{SERVICE_CONTACT_FUTURE_DIRECTION}</p>
      </div>
    </div>
  );
}
