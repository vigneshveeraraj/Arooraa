/**
 * One small, distinct glyph per engineering principle (W3.1 §14) — each
 * principle gets its own unique editorial mark rather than nine identical
 * cards. All aria-hidden; the principle title/body are real text elsewhere.
 */

const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function SolveRealProblemIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" {...common} />
      <circle cx="12" cy="12" r="5" {...common} />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function ReduceComplexityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" {...common} />
      <line x1="4" y1="12" x2="15" y2="12" {...common} />
      <line x1="4" y1="17" x2="10" y2="17" {...common} />
    </svg>
  );
}

export function BuildForChangeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20 V13 M12 13 L6 6 M12 13 L18 6" {...common} />
    </svg>
  );
}

export function ReliabilityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 L20 6 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V6 Z" {...common} />
      <path d="M8.5 12 L11 14.5 L16 9" {...common} />
    </svg>
  );
}

export function SecurityByDesignIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" {...common} />
      <path d="M8 11 V7 a4 4 0 0 1 8 0 V11" {...common} />
    </svg>
  );
}

export function EarnedComplexityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="3" {...common} />
    </svg>
  );
}

export function EvidenceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="6" {...common} />
      <line x1="14.5" y1="14.5" x2="20" y2="20" {...common} />
      <line x1="8" y1="12" x2="8" y2="8" {...common} />
      <line x1="10.5" y1="12" x2="10.5" y2="6.5" {...common} />
    </svg>
  );
}

export function HumanControlIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="6" rx="3" {...common} />
      <circle cx="8.5" cy="13" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function OperateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12a7 7 0 0 1 12-5" {...common} />
      <path d="M19 12a7 7 0 0 1-12 5" {...common} />
      <path d="M17 5 L17 7.5 L14.5 7.5" {...common} />
      <path d="M7 19 L7 16.5 L9.5 16.5" {...common} />
    </svg>
  );
}
