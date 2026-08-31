const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function SoftwareDomainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7 L3 12 L8 17" {...common} />
      <path d="M16 7 L21 12 L16 17" {...common} />
    </svg>
  );
}

export function DataDomainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <line x1="6" y1="18" x2="6" y2="12" {...common} />
      <line x1="12" y1="18" x2="12" y2="6" {...common} />
      <line x1="18" y1="18" x2="18" y2="9" {...common} />
    </svg>
  );
}

export function CloudDomainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0 -10.6 1.2A3.5 3.5 0 0 0 7 17Z" {...common} />
    </svg>
  );
}

export function ConnectedDomainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="8" width="8" height="10" rx="2" {...common} />
      <path d="M16 10a4 4 0 0 1 0 4" {...common} />
      <path d="M19 8a7 7 0 0 1 0 8" {...common} />
    </svg>
  );
}
