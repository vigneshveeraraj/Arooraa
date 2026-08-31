import { Button } from "@/components/ui/Button";
import { CAREERS_ROUTING_CONTENT, CONTACT_INFO_CONTENT } from "@/lib/content/contact";
import styles from "./ContactInfoPanel.module.css";

/**
 * The editorial left column (W3.4 §5) — explains what this form is for, and routes Careers
 * intent away from it entirely (W3.4 §7: no résumé collection here, ever). Deliberately no
 * office address, phone number, department email, or support hours (W3.4 §6) — none are
 * approved for publication yet, so the form remains the primary channel.
 */
export function ContactInfoPanel() {
  return (
    <div className={styles.panel}>
      <p className="text-eyebrow">{CONTACT_INFO_CONTENT.eyebrow}</p>
      <h2 className={`text-h3 ${styles.title}`}>{CONTACT_INFO_CONTENT.title}</h2>

      <ul className={styles.list}>
        {CONTACT_INFO_CONTENT.items.map((item) => (
          <li key={item.title} className={styles.item}>
            <p className={`text-h4 ${styles.itemTitle}`}>{item.title}</p>
            <p className={`text-body-sm ${styles.itemBody}`}>{item.body}</p>
          </li>
        ))}
      </ul>

      <div className={styles.careersNote}>
        <p className={`text-h4 ${styles.careersTitle}`}>{CAREERS_ROUTING_CONTENT.title}</p>
        <p className={`text-body-sm ${styles.careersBody}`}>{CAREERS_ROUTING_CONTENT.body}</p>
        <Button href={CAREERS_ROUTING_CONTENT.cta.href} variant="ghost">
          {CAREERS_ROUTING_CONTENT.cta.label}
        </Button>
      </div>
    </div>
  );
}
