/**
 * One small glyph per solution-model card (W3.2A §8) — abstract, geometric,
 * never clip-art. All aria-hidden; the card's own label/description carry
 * the meaning as real text.
 */

const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function NewProductIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" {...common} />
      <line x1="12" y1="8" x2="12" y2="16" {...common} />
      <line x1="8" y1="12" x2="16" y2="12" {...common} />
    </svg>
  );
}

export function ExistingProductIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="9" width="12" height="12" rx="2" {...common} />
      <path d="M8 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" {...common} />
    </svg>
  );
}

export function AiDataIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="7" r="2" {...common} />
      <circle cx="18" cy="7" r="2" {...common} />
      <circle cx="12" cy="18" r="2" {...common} />
      <line x1="7.5" y1="8.2" x2="10.7" y2="16.2" {...common} />
      <line x1="16.5" y1="8.2" x2="13.3" y2="16.2" {...common} />
      <line x1="8" y1="7" x2="16" y2="7" {...common} />
    </svg>
  );
}

export function ModernizationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="9" width="7" height="7" rx="1.5" strokeDasharray="2.5 3" {...common} />
      <rect x="14" y="8" width="7" height="8" rx="1.5" {...common} />
      <path d="M11 12.5h2" {...common} />
      <path d="M12 11 L14 12.5 L12 14" {...common} />
    </svg>
  );
}

export function CloudPlatformIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0 -10.6 1.2A3.5 3.5 0 0 0 7 17Z" {...common} />
    </svg>
  );
}

export function ContinuousEngineeringIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12a7 7 0 0 1 12-5" {...common} />
      <path d="M19 12a7 7 0 0 1-12 5" {...common} />
      <path d="M17 5 L17 7.5 L14.5 7.5" {...common} />
      <path d="M7 19 L7 16.5 L9.5 16.5" {...common} />
    </svg>
  );
}

export function ConnectedProductIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="8" width="8" height="10" rx="2" {...common} />
      <path d="M16 10a4 4 0 0 1 0 4" {...common} />
      <path d="M19 8a7 7 0 0 1 0 8" {...common} />
    </svg>
  );
}

export function NeedsGuidanceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" {...common} />
      <path d="M9.5 9.3a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.2 1-1.2 2" {...common} />
      <circle cx="12" cy="16.6" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
