import styles from "./TableQrGlyph.module.css";

/**
 * A fixed, hand-authored set of "data cell" positions inside the QR face —
 * decorative geometry only, not an encoding of any real data. It cannot
 * resolve to a URL because no string was ever encoded into it.
 */
const DATA_CELLS: Array<[number, number]> = [
  [34, 21],
  [38, 21],
  [42, 21],
  [54, 21],
  [21, 34],
  [38, 34],
  [46, 34],
  [54, 34],
  [58, 34],
  [34, 38],
  [50, 38],
  [58, 38],
  [21, 42],
  [38, 42],
  [46, 42],
  [34, 46],
  [42, 46],
  [58, 46],
  [21, 50],
  [46, 50],
  [54, 50],
  [34, 54],
  [50, 54],
  [58, 54],
];

interface TableQrGlyphProps {
  size?: "sm" | "md";
}

/**
 * W2.1.2B — the reusable "Table QR" visual primitive: a small table-stand
 * card with a realistic-looking but entirely decorative QR-style pattern.
 * It is not a real, scannable QR code (no data was ever encoded into it)
 * and it does not link anywhere. Entirely aria-hidden — every place this
 * is used pairs it with real, visible text ("Scan the table QR" or
 * similar), per the accessibility rule that meaning must never live only
 * inside a graphic.
 */
export function TableQrGlyph({ size = "md" }: TableQrGlyphProps) {
  return (
    <svg
      className={`${styles.glyph} ${size === "sm" ? styles.sm : ""}`}
      viewBox="0 0 80 100"
      aria-hidden="true"
      focusable="false"
    >
      <line className={styles.baseLine} x1="10" y1="96" x2="70" y2="96" />
      <rect className={styles.standBase} x="30" y="86" width="20" height="10" rx="2" />
      <rect className={styles.card} x="8" y="8" width="64" height="80" rx="8" />
      <rect className={styles.qrBg} x="18" y="18" width="44" height="44" rx="4" />

      <rect className={styles.finder} x="21" y="21" width="10" height="10" />
      <rect className={styles.finderHole} x="24" y="24" width="4" height="4" />
      <rect className={styles.finder} x="49" y="21" width="10" height="10" />
      <rect className={styles.finderHole} x="52" y="24" width="4" height="4" />
      <rect className={styles.finder} x="21" y="49" width="10" height="10" />
      <rect className={styles.finderHole} x="24" y="52" width="4" height="4" />

      {DATA_CELLS.map(([x, y], index) => (
        <rect key={index} className={styles.cell} x={x} y={y} width="3" height="3" />
      ))}
    </svg>
  );
}
