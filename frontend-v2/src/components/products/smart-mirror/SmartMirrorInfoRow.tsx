import { SmartMirrorGlyphIcon, type SmartMirrorGlyph } from "./SmartMirrorGlyphIcon";
import styles from "./SmartMirrorInfoRow.module.css";

export type { SmartMirrorGlyph };

interface SmartMirrorInfoRowProps {
  glyph: SmartMirrorGlyph;
  label: string;
  detail?: string;
}

/**
 * A single glanceable row inside a SmartMirrorFrame screen (P4) — icon +
 * label, no per-row background chip, since Smart Mirror's minimal-UI
 * direction (per the brief) calls for text/icon glimpses directly on the
 * glass rather than a list of button-like rows.
 */
export function SmartMirrorInfoRow({ glyph, label, detail }: SmartMirrorInfoRowProps) {
  return (
    <div className={styles.row}>
      <SmartMirrorGlyphIcon glyph={glyph} className={styles.glyph} />
      <span className={styles.label}>{label}</span>
      {detail ? <span className={styles.detail}>{detail}</span> : null}
    </div>
  );
}
