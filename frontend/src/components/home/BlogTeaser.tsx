import styles from "./BlogTeaser.module.css";

const POSTS = [
  {
    category: "OPERATIONS",
    title: "Why QR ordering is only the entry point",
    readTime: "6 min read",
    thumb: styles.thumbPurple,
  },
  {
    category: "AI",
    title: "What AI-first really means for restaurants",
    readTime: "5 min read",
    thumb: styles.thumbOrange,
  },
  {
    category: "KITCHEN",
    title: "Cutting prep time with a live display system",
    readTime: "4 min read",
    thumb: styles.thumbBlue,
  },
] as const;

export function BlogTeaser() {
  return (
    <section id="blog" className={styles.section}>
      <div className="container">
        <div className={styles.headRow}>
          <div>
            <p className="eyebrow">Insights</p>
            <h2 className={styles.heading}>Restaurant technology, decoded.</h2>
          </div>
          <a href="/blog.html" className={styles.viewAll}>
            View all articles →
          </a>
        </div>

        <div className={styles.grid}>
          {POSTS.map((post) => (
            <a key={post.title} href="/blog.html" className={styles.card}>
              <div className={`${styles.thumb} ${post.thumb}`} aria-hidden="true" />
              <span className={styles.category}>{post.category}</span>
              <h3 className={styles.cardTitle}>{post.title}</h3>
              <span className={styles.readTime}>{post.readTime}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
