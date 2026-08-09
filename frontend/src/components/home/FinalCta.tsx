import { BookDemoButton } from "@/components/demo-request/BookDemoButton";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section id="contact" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <h2 className={styles.heading}>
          Ready to build smarter
          <br />
          business operations?
        </h2>
        <p className={styles.subtitle}>
          Book a MESA demo, or talk to us about an AI or software product for your business.
        </p>
        <div className={styles.ctaRow}>
          <BookDemoButton className="btn btnPrimary">Book a Demo</BookDemoButton>
          <a href="#contact" className="btn btnGhostOnDark">
            Contact Arooraa
          </a>
        </div>
      </div>
    </section>
  );
}
