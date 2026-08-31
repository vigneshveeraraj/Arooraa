import type { ComponentType } from "react";
import { BillIcon, CallWaiterIcon, KitchenIcon, MenuIcon, OrderIcon, PlayIcon, ServiceIcon } from "./JourneyIcons";
import { TableQrGlyph } from "./TableQrGlyph";
import styles from "./TableOrbitVisual.module.css";

interface TableExperienceItem {
  Icon: ComponentType | null;
  glyph?: boolean;
  label: string;
}

const AT_THE_TABLE: TableExperienceItem[] = [
  { Icon: null, glyph: true, label: "Scan the table QR" },
  { Icon: MenuIcon, label: "Mobile Menu" },
  { Icon: OrderIcon, label: "Order" },
  { Icon: PlayIcon, label: "Play While Waiting" },
];

const AROUND_THE_TABLE: TableExperienceItem[] = [
  { Icon: CallWaiterIcon, label: "Call Waiter" },
  { Icon: ServiceIcon, label: "Service" },
  { Icon: KitchenIcon, label: "Kitchen" },
  { Icon: BillIcon, label: "Billing" },
];

/**
 * The signature Chapter 3 visual — rebuilt W2.1.2B into a "MESA Table
 * Experience Layer" instead of seven captions scattered around the photo.
 * The photo shows a guest with a physical menu; that stays true general
 * restaurant atmosphere, but the two grouped panels below it are the real
 * product story: what the guest does on their phone at the table (Scan,
 * Mobile Menu, Order, Play) versus what the restaurant does around the
 * table (Call Waiter, Service, Kitchen, Billing) — connected, not
 * competing. The billing tablet's baked "$64.80" is masked here in CSS as
 * a second layer of protection; the shipped table-story.webp file itself
 * was also permanently neutralized in that region (W2.1.2B raster
 * hardening), so the fabricated price cannot be read either way.
 */
export function TableOrbitVisual() {
  return (
    <figure className={styles.wrapper}>
      <div className={styles.imageFrame}>
        <img
          src="/images/work/mesa/story/table-story.webp"
          alt="Concept visualization showing guest, table, service, kitchen and billing moments meeting around the dining table."
          width={1400}
          height={1050}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.metricMask} aria-hidden="true" />
      </div>
      <figcaption className={styles.figcaption}>
        Concept visualization — the table as the shared context between guest experience and restaurant operations.
      </figcaption>

      <div className={styles.layer}>
        <div className={styles.group}>
          <p className={styles.groupLabel}>At the Table</p>
          <ul className={styles.chips}>
            {AT_THE_TABLE.map((item) => (
              <li key={item.label} className={styles.chip}>
                <span className={styles.chipIcon}>{item.glyph ? <TableQrGlyph size="sm" /> : item.Icon ? <item.Icon /> : null}</span>
                <span className={styles.chipLabel}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bridge} aria-hidden="true">
          <span className={styles.bridgeMark}>MESA</span>
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Around the Table</p>
          <ul className={styles.chips}>
            {AROUND_THE_TABLE.map((item) => (
              <li key={item.label} className={styles.chip}>
                <span className={styles.chipIcon}>{item.Icon ? <item.Icon /> : null}</span>
                <span className={styles.chipLabel}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.principle}>Digital when convenient. Human when needed.</p>
    </figure>
  );
}
