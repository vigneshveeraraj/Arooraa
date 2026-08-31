import { FUTURE_DIRECTION } from "@/lib/content/about";
import { SoftwareDomainIcon, DataDomainIcon, CloudDomainIcon, ConnectedDomainIcon } from "./FutureDomainIcons";
import styles from "./FutureHorizonVisual.module.css";

const VIEW_W = 640;
const VIEW_H = 360;
const ORIGIN = { x: 60, y: 180 };
const TARGETS = [
  { x: 560, y: 50 },
  { x: 580, y: 150 },
  { x: 580, y: 230 },
  { x: 560, y: 320 },
];

const ICONS = [SoftwareDomainIcon, DataDomainIcon, CloudDomainIcon, ConnectedDomainIcon];
const ACCENTS = [styles.electric, styles.lavender, styles.cyan, styles.green];

function midpoint(from: { x: number; y: number }, to: { x: number; y: number }, t: number) {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

/**
 * Chapter 11's bright "capability horizon" (W3.1 §19) — one present-day
 * point fanning out into four domain paths, each rendered dashed near the
 * origin and solid near its label, so the future reads as multiple
 * diverging directions rather than a single roadmap line.
 */
export function FutureHorizonVisual() {
  return (
    <div className={styles.frame}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" className={styles.scene}>
        {TARGETS.map((target, index) => {
          const mid = midpoint(ORIGIN, target, 0.45);
          return (
            <g key={index}>
              <line x1={ORIGIN.x} y1={ORIGIN.y} x2={mid.x} y2={mid.y} className={styles.pathDashed} />
              <line x1={mid.x} y1={mid.y} x2={target.x} y2={target.y} className={`${styles.pathSolid} ${ACCENTS[index]}`} />
            </g>
          );
        })}
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="10" className={styles.origin} />
        <path
          d="M12 1 C12.9 7.1 16.9 11.1 23 12 C16.9 12.9 12.9 16.9 12 23 C11.1 16.9 7.1 12.9 1 12 C7.1 11.1 11.1 7.1 12 1 Z"
          transform={`translate(${ORIGIN.x - 11},${ORIGIN.y - 11})`}
          className={styles.originSpark}
        />
      </svg>

      {FUTURE_DIRECTION.horizonDomains.map((domain, index) => {
        const Icon = ICONS[index]!;
        const target = TARGETS[index]!;
        return (
          <div
            key={domain}
            className={`${styles.domain} ${ACCENTS[index]}`}
            style={{ left: `${(target.x / VIEW_W) * 100}%`, top: `${(target.y / VIEW_H) * 100}%` }}
          >
            <span className={styles.domainIcon} aria-hidden="true">
              <Icon />
            </span>
            <span className={`text-label ${styles.domainLabel}`}>{domain}</span>
          </div>
        );
      })}
    </div>
  );
}
