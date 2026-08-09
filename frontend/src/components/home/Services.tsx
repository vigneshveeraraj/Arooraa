import Link from "next/link";
import { SERVICES } from "@/lib/services-content";
import styles from "./Services.module.css";

export function Services() {
  return (
    <section id="services" className={styles.section}>
      <div className="container">
        <p className="eyebrow">Services</p>
        <h2 className={styles.heading}>Where we help.</h2>
        <p className={styles.subtitle}>
          From an early idea to a system that needs to evolve — six ways we work with businesses and
          founders.
        </p>

        <div className={styles.grid}>
          {SERVICES.map((service) => (
            <Link key={service.id} href={`/services#${service.id}`} className={styles.card}>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardBody}>{service.outcome}</p>
              <span className={styles.cardLink}>Learn more →</span>
            </Link>
          ))}
        </div>

        <Link href="/services" className={`btn btnGhostOnDark ${styles.allServicesLink}`}>
          See all services
        </Link>
      </div>
    </section>
  );
}
