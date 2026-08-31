/**
 * One small glyph per engagement-model card (W3.2A §7–8) — abstract,
 * geometric, never clip-art. All aria-hidden.
 */

const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function DiscoverDefineIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="6" {...common} />
      <line x1="14.5" y1="14.5" x2="20" y2="20" {...common} />
    </svg>
  );
}

export function DesignBuildIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20 L14 10" {...common} />
      <path d="M13 7 L17 11" {...common} />
      <path d="M15.5 4.5 L19.5 8.5 L17 11 L13 7 Z" {...common} />
      <line x1="4" y1="20" x2="6.5" y2="20" {...common} />
    </svg>
  );
}

export function ImproveModernizeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 17 L10 11 L14 15 L20 8" {...common} />
      <path d="M15 8 L20 8 L20 13" {...common} />
    </svg>
  );
}

export function AddAiAutomationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="14" r="2" {...common} />
      <circle cx="16" cy="9" r="2" {...common} />
      <line x1="10.5" y1="12.5" x2="14.5" y2="10.5" {...common} />
      <line x1="18" y1="5" x2="18" y2="8" {...common} />
      <line x1="16.5" y1="6.5" x2="19.5" y2="6.5" {...common} />
    </svg>
  );
}

export function EngineeringCollaborationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="12" r="5.5" {...common} />
      <circle cx="15" cy="12" r="5.5" {...common} />
    </svg>
  );
}

export function ContinuousPartnerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 15c-1.7 0-3-1.3-3-3s1.3-3 3-3c2.5 0 5.5 6 8 6 1.7 0 3-1.3 3-3s-1.3-3-3-3c-2.5 0-5.5 6-8 6Z"
        {...common}
      />
    </svg>
  );
}

export function NeedsRecommendationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 L14 9 L20 9 L15 13 L17 19 L12 15.5 L7 19 L9 13 L4 9 L10 9 Z" {...common} />
    </svg>
  );
}
