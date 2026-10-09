import Link from "next/link";
import styles from "./ArooraaLogo.module.css";

type ArooraaLogoProps = {
  /** Distinguishes the SVG gradient id when the logo appears more than once on a page. */
  idSuffix: string;
  tone?: "light" | "dark";
};

/**
 * The AROORAA mark exactly as the main site's Nav and Footer draw it (same path and
 * gradient), with the TECHNOLOGIES wordmark. Always links to the main English website.
 */
export function ArooraaLogo({ idSuffix, tone = "light" }: ArooraaLogoProps) {
  const gradientId = `campaign-aroo-mark-${idSuffix}`;
  return (
    <Link prefetch={false} href="/" className={`${styles.logo} ${tone === "dark" ? styles.onDark : ""}`} aria-label="AROORAA Technologies — main website">
      <svg width="36" height="36" viewBox="0 0 34 34" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="2" y1="2" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9B8BFF" />
            <stop offset="1" stopColor="#5B4BE0" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="31" height="31" rx="9.5" fill={`url(#${gradientId})`} />
        <path d="M17 7.5 L25.5 26.5 H21.4 L19.85 22.7 H14.15 L12.6 26.5 H8.5 Z M15.3 19.2 H18.7 L17 14.9 Z" fill="#fff" />
        <circle cx="24.5" cy="9.5" r="2" fill="#fff" opacity="0.85" />
      </svg>
      <span className={styles.wordmark}>
        AROORAA
        <small>Technologies</small>
      </span>
    </Link>
  );
}
