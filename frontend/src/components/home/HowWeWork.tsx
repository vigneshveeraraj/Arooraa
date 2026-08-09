import styles from "./HowWeWork.module.css";

const STAGES: { icon: string; label: string }[] = [
  { icon: "💡", label: "Idea / Problem" },
  { icon: "🔍", label: "Discovery" },
  { icon: "📝", label: "Product Definition" },
  { icon: "🎨", label: "UX/UI" },
  { icon: "🏗️", label: "Architecture" },
  { icon: "💻", label: "Development" },
  { icon: "✅", label: "Testing" },
  { icon: "🚀", label: "Deployment" },
  { icon: "🛠️", label: "Continuous Support" },
];

export function HowWeWork() {
  return (
    <section id="how-we-work" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">How we work</p>
        <h2 className={styles.heading}>Idea to production, one connected process.</h2>
        <p className={styles.subtitle}>
          The same disciplined pipeline behind every Arooraa engagement — including MESA, our own
          product.
        </p>

        <div className={styles.flow}>
          <span className={styles.line} aria-hidden="true" />
          {STAGES.map((stage) => (
            <div key={stage.label} className={styles.node}>
              <span className={styles.iconCircle}>{stage.icon}</span>
              <span className={styles.nodeLabel}>{stage.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
