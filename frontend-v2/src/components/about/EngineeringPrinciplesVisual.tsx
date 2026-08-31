import { ENGINEERING_PRINCIPLES } from "@/lib/content/about";
import {
  SolveRealProblemIcon,
  ReduceComplexityIcon,
  BuildForChangeIcon,
  ReliabilityIcon,
  SecurityByDesignIcon,
  EarnedComplexityIcon,
  EvidenceIcon,
  HumanControlIcon,
  OperateIcon,
} from "./PrincipleIcons";
import styles from "./EngineeringPrinciplesVisual.module.css";

const ICONS = [
  SolveRealProblemIcon,
  ReduceComplexityIcon,
  BuildForChangeIcon,
  ReliabilityIcon,
  SecurityByDesignIcon,
  EarnedComplexityIcon,
  EvidenceIcon,
  HumanControlIcon,
  OperateIcon,
];

const ACCENTS = [styles.accentIndigo, styles.accentElectric, styles.accentCyan, styles.accentAmber, styles.accentGreen, styles.accentLavender];

/**
 * Nine engineering principles (W3.1 §14), each with its own glyph and a
 * cycled accent color so the grid reads as "brighter accent
 * differentiation" rather than nine identical white cards.
 */
export function EngineeringPrinciplesVisual() {
  return (
    <ol className={styles.grid}>
      {ENGINEERING_PRINCIPLES.map((principle, index) => {
        const Icon = ICONS[index]!;
        const accent = ACCENTS[index % ACCENTS.length]!;
        return (
          <li key={principle.title} className={`${styles.card} ${accent}`}>
            <span className={styles.iconChip} aria-hidden="true">
              <Icon />
            </span>
            <h3 className={`text-h4 ${styles.title}`}>{principle.title}</h3>
            <p className={`text-body-sm ${styles.body}`}>{principle.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
