import styles from "./StatsBar.module.css";

const STATS = [
  { value: "2 min", label: "To order, down from 8" },
  { value: "5–12%", label: "More table turns per day" },
  { value: "<60s", label: "To split any bill" },
  { value: "99.9%", label: "Uptime architecture" },
] as const;

export function StatsBar() {
  return (
    <section className={styles.statsBar}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>ONE PLATFORM, FROM TABLE TO BUSINESS DECISION</p>
        <div className={styles.grid}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={`${styles.value} gradientText`}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
