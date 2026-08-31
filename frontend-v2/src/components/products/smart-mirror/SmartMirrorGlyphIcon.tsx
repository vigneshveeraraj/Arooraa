import type { ReactNode } from "react";

export type SmartMirrorGlyph =
  | "time"
  | "weather"
  | "event"
  | "reminder"
  | "family"
  | "home"
  | "energy"
  | "memory"
  | "security"
  | "wellness";

const GLYPH_PATHS: Record<SmartMirrorGlyph, ReactNode> = {
  time: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v4l2.5 1.5" />
    </>
  ),
  weather: (
    <>
      <circle cx="8" cy="8" r="3.2" />
      <path d="M12.5 13.5h-8a2.5 2.5 0 0 1 .5-4.96A3.6 3.6 0 0 1 12 10a2.3 2.3 0 0 1 .5 3.5Z" />
    </>
  ),
  event: (
    <>
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14" />
      <path d="M7 2.5v3" />
      <path d="M13 2.5v3" />
    </>
  ),
  reminder: (
    <>
      <path d="M10 3a4.5 4.5 0 0 0-4.5 4.5c0 4-1.5 5-1.5 5h12s-1.5-1-1.5-5A4.5 4.5 0 0 0 10 3Z" />
      <path d="M8.5 15a1.5 1.5 0 0 0 3 0" />
    </>
  ),
  family: (
    <>
      <circle cx="7" cy="7.5" r="2.5" />
      <circle cx="13.5" cy="8.5" r="2" />
      <path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <path d="M12 12.3c1.9.2 3.5 1.5 3.5 3.7" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5 10 4l7 6.5" />
      <path d="M5 9v7h10V9" />
    </>
  ),
  energy: <path d="M11 2 4.5 11.5H9l-1 6.5L15.5 8.5H11Z" />,
  memory: (
    <>
      <rect x="4" y="3" width="12" height="14" rx="1.5" />
      <path d="M7 7h6" />
      <path d="M7 10.5h6" />
      <path d="M7 14h3.5" />
    </>
  ),
  security: <path d="M10 2.5 16 5v5c0 4.5-2.8 7-6 8.5-3.2-1.5-6-4-6-8.5V5Z" />,
  wellness: <path d="M10 17s-6.5-4-6.5-8.6A3.9 3.9 0 0 1 10 6a3.9 3.9 0 0 1 6.5 2.4C16.5 13 10 17 10 17Z" />,
};

interface SmartMirrorGlyphIconProps {
  glyph: SmartMirrorGlyph;
  className?: string;
}

/**
 * The shared original icon set for Smart Mirror (P4) — one set of
 * hand-drawn glyph paths reused everywhere a glyph appears (info rows,
 * dashboard tiles), so every icon looks identical wherever it recurs
 * instead of drifting into slightly different shapes per component. No
 * third-party icon library.
 */
export function SmartMirrorGlyphIcon({ glyph, className }: SmartMirrorGlyphIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPH_PATHS[glyph]}
    </svg>
  );
}
