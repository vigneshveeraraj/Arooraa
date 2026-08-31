/**
 * Small per-product glyphs for the product constellation (W3.1 §8) — one
 * distinct, abstract cue per product "world" (restaurant/operations,
 * memory/family, ambient/reflective, home/energy), never a literal photo or
 * logo. All aria-hidden; the product name and description are real text
 * elsewhere in ProductConstellationVisual.
 */

export function MesaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="11" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MindraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15.5" cy="14.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SmartMirrorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="3" width="12" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="9" y1="6.5" x2="9" y2="17.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

export function SmartHomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12 L12 5 L20 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 11 V20 H18 V11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
