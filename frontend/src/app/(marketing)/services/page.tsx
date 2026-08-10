import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/lib/services-content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Services — Arooraa | Product Engineering & Software Development",
  description:
    "Idea & product consulting, websites & digital platforms, custom software, AI & automation, application modernization, and cloud & continuous support.",
};

export default function ServicesPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.intro}>
          <p className="eyebrow">Services</p>
          <h1 className={styles.heading}>Where we help.</h1>
          <p className={styles.subtitle}>
            We work with founders and businesses across the product lifecycle — from an early idea or
            business problem through to a live, supported product. Here&apos;s what that looks like in
            practice.
          </p>
        </div>

        <div className={styles.list}>
          {SERVICES.map((service) => (
            <article key={service.id} id={service.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{service.title}</h2>
              <p className={styles.cardOutcome}>{service.outcome}</p>

              <div className={styles.detailGrid}>
                <div>
                  <p className={styles.detailLabel}>The problem</p>
                  <p className={styles.detailBody}>{service.problem}</p>
                </div>
                <div>
                  <p className={styles.detailLabel}>What we do</p>
                  <p className={styles.detailBody}>{service.whatWeDo}</p>
                </div>
              </div>

              <p className={styles.detailLabel}>Typical solutions</p>
              <ul className={styles.solutionList}>
                {service.solutionTypes.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>

              <p className={styles.engagement}>{service.engagementStyle}</p>

              <Link href={`/start-project?service=${service.id}`} className="btn btnPrimary">
                Start a Project →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
