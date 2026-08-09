import styles from "./WhatWeDo.module.css";

const PILLARS = [
  {
    title: "Discover & Define",
    body: "We start with your idea or business problem, not a spec — clarifying what's worth building and why.",
  },
  {
    title: "Design & Build",
    body: "UX/UI, architecture and development, done by engineers who own the outcome, not just the ticket.",
  },
  {
    title: "Launch & Support",
    body: "Testing, deployment and continuous support after launch — we stay involved as your product grows.",
  },
] as const;

export function WhatWeDo() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className="eyebrow">What we do</p>
        <h2 className={styles.heading}>A product engineering partner, not just a dev shop.</h2>
        <p className={styles.subtitle}>
          We work with founders and businesses across the full lifecycle — from an early idea or
          business problem to a live, supported product.
        </p>

        <div className={styles.grid}>
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className={styles.pillar}>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarBody}>{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
