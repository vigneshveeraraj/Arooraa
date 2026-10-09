import { Icon } from "./Icon";
import { CONTACT } from "./content";
import styles from "./WhatsAppFloat.module.css";

/** Always-visible WhatsApp button for desktop visitors (see the CSS for why not on phones). */
export function WhatsAppFloat() {
  return (
    <a
      className={styles.float}
      href={CONTACT.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with AROORAA on WhatsApp"
    >
      <Icon name="whatsapp" size={24} />
      <span aria-hidden="true">WhatsApp</span>
    </a>
  );
}
