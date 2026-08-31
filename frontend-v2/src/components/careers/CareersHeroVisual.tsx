import styles from "./CareersHeroVisual.module.css";

interface Stream {
  label: string;
  y: number;
  targetY: number;
  color: string;
}

/**
 * Purely decorative (W3.3A §5) — six disciplines (engineering, AI, design,
 * product, sales, marketing) shown as distinct colored workstreams
 * converging toward one shared product outcome. Deliberately NOT the
 * homepage's hub-and-spoke HeroVisual pattern (§5 explicitly asks for
 * something other than a simplistic radial diagram) — a different, careers-
 * specific composition using the same deep-navy/electric-blue/cyan/purple/
 * amber accent family.
 */
const STREAMS: Stream[] = [
  { label: "Engineering", y: 40, targetY: 190, color: "#2f6fed" },
  { label: "AI", y: 96, targetY: 194, color: "#0f8f9e" },
  { label: "Design", y: 152, targetY: 198, color: "#7c5cbf" },
  { label: "Product", y: 208, targetY: 202, color: "#2a359c" },
  { label: "Sales", y: 264, targetY: 206, color: "#b8790a" },
  { label: "Marketing", y: 320, targetY: 210, color: "#2f8f5b" },
];

export function CareersHeroVisual() {
  return (
    <svg viewBox="0 0 480 360" className={styles.svg} aria-hidden="true">
      {STREAMS.map((stream) => {
        const path = `M108,${stream.y} C200,${stream.y} 270,${(stream.y + stream.targetY) / 2} 366,${stream.targetY}`;
        return (
          <g key={stream.label}>
            <text x={0} y={stream.y + 4} className={styles.label} style={{ fill: stream.color }}>
              {stream.label}
            </text>
            <circle cx={98} cy={stream.y} r={4} fill={stream.color} />
            <path d={path} className={styles.stream} style={{ stroke: stream.color }} />
          </g>
        );
      })}

      <rect x={368} y={148} width={92} height={104} rx={16} className={styles.destination} />
      <text x={414} y={192} textAnchor="middle" className={styles.destinationTitle}>
        AROORAA
      </text>
      <text x={414} y={212} textAnchor="middle" className={styles.destinationCaption}>
        <tspan x={414} dy="0">
          Useful
        </tspan>
        <tspan x={414} dy="16">
          Products
        </tspan>
      </text>
    </svg>
  );
}
