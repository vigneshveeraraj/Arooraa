import styles from "./WhyAroora.module.css";

const REASONS = [
  {
    title: "We build products, not just tickets",
    body: "End-to-end ownership from idea to deployment — not just executing a spec handed to us.",
  },
  {
    title: "Engineering discipline you can see",
    body: "MESA is our own product, built and run by the same team. It's proof, not a slide.",
  },
  {
    title: "Honest about what's live",
    body: "The same Available / Preview / Roadmap transparency we use for MESA, we bring to every engagement.",
  },
  {
    title: "AI where it helps — not everywhere",
    body: "AI is a capability we apply when it genuinely fits, not the mandatory answer to every project.",
  },
] as const;

export function WhyAroora() {
  return (
    <section id="why-us" className={styles.section}>
      <div className="container">
        <p className="eyebrow">Why Arooraa</p>
        <h2 className={styles.heading}>Why work with us.</h2>

        <div className={styles.grid}>
          {REASONS.map((reason) => (
            <div key={reason.title} className={styles.item}>
              <h3 className={styles.itemTitle}>{reason.title}</h3>
              <p className={styles.itemBody}>{reason.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
