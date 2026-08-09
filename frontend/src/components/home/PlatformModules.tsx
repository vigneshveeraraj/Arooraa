import styles from "./PlatformModules.module.css";

const MODULES = [
  {
    icon: "📱",
    status: "AVAILABLE",
    title: "Digital Menu & QR Ordering",
    body: "Guests scan, browse a rich menu and order from the table — no app, no waiting.",
  },
  {
    icon: "🍽️",
    status: "AVAILABLE",
    title: "Table & Session Management",
    body: "Track every dining session from seating to settle, across the whole floor.",
  },
  {
    icon: "🔥",
    status: "AVAILABLE",
    title: "Kitchen Display System",
    body: "Live tickets, prep timers and clear station routing keep the kitchen calm.",
  },
  {
    icon: "📋",
    status: "AVAILABLE",
    title: "Order Management",
    body: "Every order synced across customer, waiter, kitchen and billing in real time.",
  },
  {
    icon: "💳",
    status: "AVAILABLE",
    title: "Billing & Payment Flow",
    body: "Fast, accurate bills with split, discount and tax handling in one tap.",
  },
  {
    icon: "📊",
    status: "AVAILABLE",
    title: "Owner Dashboard",
    body: "Sales, prep times and table turns — real-time visibility into your business.",
  },
  {
    icon: "✦",
    status: "PREVIEW",
    title: "AI Restaurant Intelligence",
    body: "Actionable insights on offers, staffing and menu performance.",
  },
  {
    icon: "🏢",
    status: "PREVIEW",
    title: "Super Admin Console",
    body: "Manage outlets, roles and configuration from one control plane.",
  },
  {
    icon: "🌐",
    status: "ROADMAP",
    title: "Multi-branch Readiness",
    body: "Built to scale from a single outlet to a growing restaurant group.",
  },
  {
    icon: "🧼",
    status: "ROADMAP",
    title: "Operations & Hygiene",
    body: "Checklists and operational tracking for consistent daily standards.",
  },
] as const;

const STATUS_CLASS: Record<string, string | undefined> = {
  AVAILABLE: styles.statusAvailable,
  PREVIEW: styles.statusPreview,
  ROADMAP: styles.statusRoadmap,
};

export function PlatformModules() {
  return (
    <section id="features" className={styles.section}>
      <div className="container">
        <p className="eyebrow">Platform modules</p>
        <h2 className={styles.heading}>Not a QR menu. A full operating platform.</h2>
        <p className={styles.subtitle}>
          Ten modules that connect every role in your restaurant. Available today, in preview, or
          on the roadmap — always honest about what&apos;s live.
        </p>

        <div className={styles.grid}>
          {MODULES.map((mod) => (
            <div key={mod.title} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.icon} aria-hidden="true">
                  {mod.icon}
                </span>
                <span className={`${styles.status} ${STATUS_CLASS[mod.status] ?? ""}`}>{mod.status}</span>
              </div>
              <h3 className={styles.cardTitle}>{mod.title}</h3>
              <p className={styles.cardBody}>{mod.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
