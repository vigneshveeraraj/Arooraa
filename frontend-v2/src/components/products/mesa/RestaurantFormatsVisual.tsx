import styles from "./RestaurantFormatsVisual.module.css";

const FORMATS = [
  {
    name: "Restaurant",
    icon: (
      <>
        <path d="M3 10 L6 6 L9 10 L12 6 L15 10 L18 6 L21 10" />
        <rect x="4" y="10" width="16" height="10" rx="1" />
        <rect x="10.5" y="15" width="3" height="5" />
      </>
    ),
  },
  {
    name: "Café",
    icon: (
      <>
        <rect x="6" y="9" width="10" height="9" rx="1.5" />
        <path d="M16 11a3 3 0 0 1 0 6" />
        <path d="M9 7q1-2 0-4" />
        <path d="M13 7q1-2 0-4" />
      </>
    ),
  },
  {
    name: "Bakery",
    icon: (
      <>
        <path d="M5 20V13a7 7 0 0 1 14 0v7" />
        <path d="M4 20h16" />
      </>
    ),
  },
  {
    name: "Bar / Lounge",
    icon: (
      <>
        <path d="M6 5h12l-6 8z" />
        <path d="M12 13v6" />
        <path d="M8 19h8" />
      </>
    ),
  },
  {
    name: "Hotel / Resort",
    icon: (
      <>
        <path d="M4 9l8-5 8 5" />
        <rect x="5" y="9" width="14" height="11" />
        <rect x="8" y="12" width="2" height="2" />
        <rect x="14" y="12" width="2" height="2" />
      </>
    ),
  },
  {
    name: "Multi-outlet food business",
    icon: (
      <>
        <rect x="2" y="12" width="5" height="7" />
        <rect x="9.5" y="10" width="5" height="9" />
        <rect x="17" y="12" width="5" height="7" />
      </>
    ),
  },
];

/**
 * Original MESA-specific visual (P2.2) for the "Why We Built It" section —
 * simple, hand-drawn storefront marks (not logos, not stock icons) for the
 * range of food-service formats already named in that section's copy.
 * Framed as "Designed for" — relevance, not proof of current deployment.
 * Every icon is decorative and aria-hidden; the format names are real,
 * visible text underneath each mark.
 */
export function RestaurantFormatsVisual() {
  return (
    <div className={styles.panel}>
      <p className={`text-eyebrow ${styles.eyebrow}`}>Designed for</p>
      <ul className={styles.grid}>
        {FORMATS.map((format) => (
          <li key={format.name} className={styles.item}>
            <svg
              viewBox="0 0 24 24"
              className={styles.icon}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {format.icon}
            </svg>
            <span className={styles.label}>{format.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
