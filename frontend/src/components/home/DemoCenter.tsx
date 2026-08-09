import { BookDemoButton } from "@/components/demo-request/BookDemoButton";
import styles from "./DemoCenter.module.css";

const TICKETS = [
  {
    table: "Table 7",
    status: "04:12",
    items: ["2× Paneer Tikka", "1× Garlic Naan"],
    note: "No onion · Table 7",
  },
  {
    table: "Table 2",
    status: "Ready",
    items: ["1× Butter Chicken", "3× Roti", "1× Dal Makhani"],
  },
  {
    table: "Table 11",
    status: "New",
    items: ["2× Masala Dosa", "2× Filter Coffee"],
  },
  {
    table: "Table 4",
    status: "07:48",
    items: ["1× Biryani", "2× Raita", "1× Gulab Jamun"],
  },
] as const;

export function DemoCenter() {
  return (
    <section id="demo" className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className="eyebrow">Demo center</p>
          <h2 className={styles.heading}>See MESA in action.</h2>
          <p className={styles.subtitle}>
            Walk through the live kitchen display, customer ordering and owner dashboard — or
            book a guided demo tailored to your restaurant.
          </p>
          <div className={styles.ctaRow}>
            <BookDemoButton className="btn btnPrimary">Book a MESA demo</BookDemoButton>
            <a
              href="https://app.arooraa.com"
              className="btn btnGhostOnDark"
              target="_blank"
              rel="noopener noreferrer"
            >
              Try live demo ↗
            </a>
          </div>
        </div>

        <div className={styles.kitchenCard}>
          <div className={styles.kitchenHeader}>
            <span>Kitchen Display</span>
            <span className={styles.activeBadge}>4 active</span>
          </div>
          <div className={styles.ticketGrid}>
            {TICKETS.map((t) => (
              <div key={t.table} className={styles.ticket}>
                <div className={styles.ticketHead}>
                  <span>{t.table}</span>
                  <span
                    className={
                      t.status === "Ready"
                        ? styles.statusReady
                        : t.status === "New"
                          ? styles.statusNew
                          : styles.statusTimer
                    }
                  >
                    {t.status}
                  </span>
                </div>
                <ul className={styles.ticketItems}>
                  {t.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {"note" in t && t.note ? <div className={styles.ticketNote}>{t.note}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
