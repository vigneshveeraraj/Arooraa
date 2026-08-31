import styles from "./BrandLogo.module.css";

interface BrandLogoProps {
  /** header = compact site-chrome sizing. footer = the brief's "slightly
   * larger" footer brand treatment. */
  size?: "header" | "footer";
  className?: string;
}

/**
 * The real AROORAA symbol + wordmark (W3.BRAND.1) — replaces the plain-text
 * Wordmark component in shared site chrome (header, footer). Both images
 * are decorative (`alt=""`); the accessible name comes from the enclosing
 * `<Link aria-label="AROORAA — home">` in SiteHeader/SiteFooter, so a
 * screen reader announces it once, not "AROORAA logo AROORAA home".
 *
 * The symbol and wordmark are two separate derivatives (see
 * design-assets/brand-source/ + public/images/brand/) rather than one
 * flattened image, because the source symbol's flowing tail extends well
 * below the wordmark's baseline — sizing them independently is what keeps
 * the lockup visually balanced at header scale.
 */
export function BrandLogo({ size = "header", className }: BrandLogoProps) {
  return (
    <span className={[styles.lockup, styles[size], className].filter(Boolean).join(" ")}>
      <img src="/images/brand/arooraa-symbol.webp" alt="" width={651} height={500} className={styles.symbol} />
      <img src="/images/brand/arooraa-wordmark.webp" alt="" width={1971} height={260} className={styles.wordmark} />
    </span>
  );
}
