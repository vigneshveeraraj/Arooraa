import styles from "./FeaturedProduct.module.css";

export function FeaturedProduct() {
  return (
    <section id="mesa" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">Featured product</p>
        <h2 className={styles.heading}>MESA — proof of how we build.</h2>
        <p className={styles.subtitle}>
          MESA is Arooraa&apos;s own restaurant operating platform, built end to end with the same
          engineering discipline we bring to every project — and honest, always, about what&apos;s
          live versus what&apos;s still on the roadmap.
        </p>
      </div>
    </section>
  );
}
