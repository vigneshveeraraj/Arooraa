import { CampaignIcon } from "../CampaignIcon";
import styles from "./Northbridge.module.css";

/** Fictional advisory firm — website design concept. Decorative (frame is aria-hidden). */

const SERVICES = [
  ["GST & Compliance", "Filing, reconciliation and notices"],
  ["Audit & Assurance", "Statutory and internal audits"],
  ["Business Advisory", "Planning, structuring and funding"],
] as const;

export function NorthbridgeDesktop() {
  return (
    <div className={styles.site}>
      <div className={styles.nav}>
        <div className={styles.logo}>
          North<span>bridge</span> Advisors
        </div>
        <div className={styles.links}>
          <span>Services</span>
          <span>Insights</span>
          <span>About</span>
        </div>
        <b>Book a consultation</b>
      </div>
      <div className={styles.hero}>
        <div>
          <div className={styles.kicker}>Tax · Audit · Advisory</div>
          <h4>Clear advice for growing businesses.</h4>
          <p>Compliance handled on time, and guidance you can act on.</p>
          <div className={styles.row}>
            <span>Book a consultation</span>
            <span>Our services</span>
          </div>
        </div>
        <img src="/images/campaign/northbridge/consultation.webp" alt="" width={960} height={640} loading="lazy" decoding="async" />
      </div>
      <div className={styles.services}>
        {SERVICES.map(([title, detail], index) => (
          <div key={title}>
            <small>0{index + 1}</small>
            <b>{title}</b>
            <span>{detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NorthbridgeMobile() {
  return (
    <div className={styles.mobile}>
      <div className={styles.kicker}>Book a consultation</div>
      <h4>Choose a time that suits you.</h4>
      <div className={styles.topics}>
        <span className={styles.on}>GST</span>
        <span>Audit</span>
        <span>Advisory</span>
      </div>
      <div className={styles.days}>
        {[
          ["Mon", "12"],
          ["Tue", "13"],
          ["Wed", "14"],
          ["Thu", "15"],
        ].map(([day, date]) => (
          <span key={date} className={date === "13" ? styles.on : undefined}>
            {day}
            <b>{date}</b>
          </span>
        ))}
      </div>
      <div className={styles.slots}>
        {["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"].map((slot) => (
          <span key={slot} className={slot === "11:30 AM" ? styles.on : undefined}>
            {slot}
          </span>
        ))}
      </div>
      <div className={styles.summary}>
        <b>Tue 13 · 11:30 AM</b>
        30-min video call · GST review
        <span>
          <CampaignIcon name="whatsapp" className={styles.mIcon} />
          Reminder on WhatsApp
        </span>
      </div>
      <div className={styles.details}>
        <span>Your name</span>
        <span>Mobile number</span>
      </div>
      <div className={styles.cta}>Confirm booking</div>
    </div>
  );
}
