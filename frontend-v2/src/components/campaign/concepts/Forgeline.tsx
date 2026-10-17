import styles from "./Forgeline.module.css";

/** Fictional manufacturer — website design concept. Decorative (frame is aria-hidden). */

const CAPABILITIES = [
  ["machining", "CNC Machining", 641],
  ["fabrication", "Structural Fabrication", 717],
  ["assembly", "Assembly", 621],
] as const;

export function ForgelineDesktop() {
  return (
    <div className={styles.site}>
      <div className={styles.nav}>
        <div className={styles.logo}>
          <i />
          FORGELINE
        </div>
        <div className={styles.links}>
          <span>Capabilities</span>
          <span>Industries</span>
          <span>Facility</span>
          <span>Contact</span>
        </div>
        <b>Request a quote</b>
      </div>
      <div className={styles.hero}>
        <img src="/images/campaign/forgeline/welding.webp" alt="" width={960} height={540} loading="lazy" decoding="async" />
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>Precision fabrication</div>
          <h4>Built to your drawings. Delivered to your schedule.</h4>
          <p>Sheet metal, machining and fabricated assemblies for industrial buyers.</p>
          <div className={styles.row}>
            <span>Request a quote</span>
            <span>View capabilities</span>
          </div>
        </div>
      </div>
      <div className={styles.caps}>
        {CAPABILITIES.map(([file, label, height], index) => (
          <div key={file}>
            <img src={`/images/campaign/forgeline/${file}.webp`} alt="" width={960} height={height} loading="lazy" decoding="async" />
            <small>0{index + 1}</small>
            <b>{label}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ForgelineMobile() {
  return (
    <div className={styles.mobile}>
      <div className={styles.kicker}>Request a quote</div>
      <h4>Tell us what you need.</h4>
      <div className={styles.field}>
        Part / product<b>Mounting bracket</b>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          Quantity<b>500 units</b>
        </div>
        <div className={styles.field}>
          Material<b>SS 304</b>
        </div>
      </div>
      <div className={styles.field}>
        Required by<b>Within 4 weeks</b>
      </div>
      <div className={styles.field}>
        Notes<b>Powder-coated, holes as per drawing</b>
      </div>
      <div className={styles.field}>
        Company email<b>purchase@yourcompany.in</b>
      </div>
      <div className={styles.upload}>
        <b>bracket-rev2.pdf</b>
        Drawing attached
      </div>
      <div className={styles.field}>
        Delivery location<b>Hosur, Tamil Nadu</b>
      </div>
      <p className={styles.consent}>We will contact you about this request only.</p>
      <div className={styles.cta}>Send request</div>
    </div>
  );
}
