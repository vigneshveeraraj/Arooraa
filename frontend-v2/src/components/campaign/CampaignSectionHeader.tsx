import { keepSuffix } from "./keepSuffix";
import styles from "./CampaignSectionHeader.module.css";

interface CampaignSectionHeaderProps {
  /** id of the h2 — the surrounding section uses it as aria-labelledby. */
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
}

/**
 * Editorial section header: eyebrow + title on the left, lead on the right (stacked on
 * small screens). Titles and leads on this page are Tamil-grammar copy, so both carry
 * lang="ta" and go through keepSuffix().
 */
export function CampaignSectionHeader({ id, eyebrow, title, lead }: CampaignSectionHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={id} className={styles.title} lang="ta">
          {keepSuffix(title)}
        </h2>
      </div>
      {lead ? (
        <p className={styles.lead} lang="ta">
          {keepSuffix(lead)}
        </p>
      ) : null}
    </header>
  );
}
