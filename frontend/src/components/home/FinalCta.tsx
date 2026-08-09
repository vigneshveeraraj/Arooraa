import Link from "next/link";
import { BookDemoButton } from "@/components/demo-request/BookDemoButton";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section id="contact" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <h2 className={styles.heading}>Ready to build something?</h2>
        <p className={styles.subtitle}>
          Start a project with our engineering team, or book a personalised MESA demo.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/start-project" className="btn btnPrimary">
            Start a Project
          </Link>
          <BookDemoButton className="btn btnGhostOnDark">Book a MESA Demo</BookDemoButton>
        </div>
      </div>
    </section>
  );
}
