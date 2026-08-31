/**
 * One small glyph per career family (W3.3A §8) — abstract and geometric,
 * matching the existing icon convention in components/start-project/icons.
 * All aria-hidden; the family name/description always carries the meaning.
 */

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AiDataIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="17" r="2.2" />
      <circle cx="19" cy="17" r="2.2" />
      <path d="M10.5 6.8 6.7 15.2M13.5 6.8l3.8 8.4M7.3 17h9.4" />
    </svg>
  );
}

export function BackendEngineeringIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      <rect x="4" y="4" width="16" height="4.5" rx="1.2" />
      <rect x="4" y="10" width="16" height="4.5" rx="1.2" />
      <rect x="4" y="16" width="16" height="4.5" rx="1.2" />
      <circle cx="7.2" cy="6.25" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7.2" cy="12.25" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7.2" cy="18.25" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FrontendEngineeringIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 8.5h17" />
      <path d="M7 12.5h5M7 15.5h8" />
    </svg>
  );
}

export function ProductDesignIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      <path d="M5 19 15 9l3-3 1 1-3 3-10 10H4z" />
      <path d="M13 6.5 17.5 11" />
    </svg>
  );
}

export function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      <path d="M4 13.5 9 8l3 3 8-8" />
      <path d="M15 3h5v5" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function MarketingGrowthIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      <path d="M4 15V9l12-4v18z" />
      <path d="M16 5v14" />
      <path d="M8 15v3.5a1.5 1.5 0 0 0 3 0V15" />
    </svg>
  );
}
