import styles from "./JourneyFlow.module.css";

const STEPS: { icon: string; label: string; sub: string; active?: boolean }[] = [
  { icon: "👤", label: "Customer", sub: "Scans, seated" },
  { icon: "📱", label: "QR Menu", sub: "Browse, add" },
  { icon: "🧾", label: "Order", sub: "Confirmed" },
  { icon: "🔥", label: "Kitchen", sub: "Live tickets", active: true },
  { icon: "💳", label: "Billing", sub: "One tap" },
  { icon: "📊", label: "Insights", sub: "Owner view" },
  { icon: "✦", label: "AI", sub: "Recommends" },
];

export function JourneyFlow() {
  return (
    <section id="journey" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">The MESA flow</p>
        <h2 className={styles.heading}>Every step, connected.</h2>
        <p className={styles.subtitle}>
          One continuous flow from the customer&apos;s table to the owner&apos;s business
          decisions — no gaps, no manual re-entry.
        </p>

        <div className={styles.flow}>
          <span className={styles.line} aria-hidden="true" />
          {STEPS.map((step) => (
            <div key={step.label} className={styles.node}>
              <span className={`${styles.iconCircle} ${step.active ? styles.iconCircleActive : ""}`}>
                {step.icon}
              </span>
              <span className={styles.nodeLabel}>{step.label}</span>
              <span className={styles.nodeSub}>{step.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
