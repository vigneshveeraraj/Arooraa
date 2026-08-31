import { SmartMirrorFrame } from "./SmartMirrorFrame";
import { SmartMirrorGlyphIcon, type SmartMirrorGlyph } from "./SmartMirrorGlyphIcon";
import styles from "./SmartMirrorDashboard.module.css";

const TILES: { label: string; glyph: SmartMirrorGlyph }[] = [
  { label: "Family", glyph: "family" },
  { label: "Wellness", glyph: "wellness" },
  { label: "Home", glyph: "home" },
  { label: "Energy", glyph: "energy" },
  { label: "Memory", glyph: "memory" },
];

/**
 * Smart Mirror's signature flagship visual (P4) — the "closer dashboard"
 * the brief calls out as one of the page's strongest assets: five
 * high-level tiles (Family, Wellness, Home, Energy, Memory) inside the
 * shared mirror frame, using the same original glyph set as every other
 * Smart Mirror visual. Explicitly a conceptual product experience, not a
 * production screenshot — no internal architecture labels, no fabricated
 * metrics. Purely decorative: every tile name already exists as real,
 * visible text in the adjacent capability grid, so the whole dashboard
 * stays aria-hidden.
 */
export function SmartMirrorDashboard() {
  return (
    <div aria-hidden="true">
      <SmartMirrorFrame size="large" className={styles.dashboardFrame}>
        <p className={styles.caption}>Concept visualization</p>
        <div className={styles.grid}>
          {TILES.map((tile) => (
            <div key={tile.label} className={styles.tile}>
              <SmartMirrorGlyphIcon glyph={tile.glyph} className={styles.tileGlyph} />
              <span className={styles.tileLabel}>{tile.label}</span>
            </div>
          ))}
        </div>
      </SmartMirrorFrame>
    </div>
  );
}
