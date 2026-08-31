import type { ComponentType } from "react";
import { BillIcon, CallWaiterIcon, MenuIcon, OrderIcon, QrIcon, ServiceIcon } from "./JourneyIcons";
import styles from "./MesaStoryHeroVisual.module.css";

interface HeroJourneyStep {
  Icon: ComponentType;
  label: string;
  secondary?: string;
}

const HERO_JOURNEY: HeroJourneyStep[] = [
  { Icon: QrIcon, label: "Scan QR" },
  { Icon: MenuIcon, label: "Browse Menu" },
  { Icon: OrderIcon, label: "Order" },
  { Icon: CallWaiterIcon, label: "Call Waiter", secondary: "or Play While Waiting" },
  { Icon: ServiceIcon, label: "Service" },
  { Icon: BillIcon, label: "Bill" },
];

/**
 * The MESA engineering story's hero (W2.1.2: premium photo; W2.1.2B: adds
 * the mobile-first guest-journey strip). The photograph alone shows a
 * guest holding a physical menu — true as general restaurant atmosphere,
 * but not the MESA ordering mechanism. This strip is the real, canonical
 * product signal: Scan QR, Browse Menu, Order, Call Waiter (or Play While
 * Waiting), Service, Bill — all real HTML text, reads as one composition
 * with the photo rather than a separate feature list beneath it.
 */
export function MesaStoryHeroVisual() {
  return (
    <figure className={styles.figure}>
      <img
        src="/images/work/mesa/story/hero.webp"
        alt="Concept illustration of guests, service staff, kitchen and billing operating around one restaurant experience."
        width={1440}
        height={810}
        className={styles.image}
        loading="eager"
      />
      <ol className={styles.journey} aria-label="The MESA guest journey">
        {HERO_JOURNEY.map(({ Icon, label, secondary }, index) => (
          <li key={label} className={styles.step}>
            {index > 0 ? <span className={styles.connector} aria-hidden="true" /> : null}
            <span className={styles.stepIcon}>
              <Icon />
            </span>
            <span className={styles.stepLabel}>{label}</span>
            {secondary ? <span className={styles.stepSecondary}>{secondary}</span> : null}
          </li>
        ))}
      </ol>
      <figcaption className={styles.caption}>MESA — connected restaurant experience, concept illustration</figcaption>
    </figure>
  );
}
