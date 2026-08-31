import type { ComponentType } from "react";
import { SOLUTION_MODEL_HEADING, SOLUTION_MODEL_OPTIONS, SOLUTION_MODEL_SUPPORTING } from "@/lib/content/start-project";
import type { SolutionModel } from "@/lib/start-project/types";
import { SelectableCard } from "./shared/SelectableCard";
import { CARD_ACCENTS } from "./accents";
import {
  AiDataIcon,
  CloudPlatformIcon,
  ConnectedProductIcon,
  ContinuousEngineeringIcon,
  ExistingProductIcon,
  ModernizationIcon,
  NeedsGuidanceIcon,
  NewProductIcon,
} from "./icons/SolutionModelIcons";
import styles from "./ModelChooser.module.css";

const ICONS: Record<SolutionModel, ComponentType> = {
  NEW_PRODUCT: NewProductIcon,
  EXISTING_PRODUCT: ExistingProductIcon,
  AI_DATA_AUTOMATION: AiDataIcon,
  APPLICATION_MODERNIZATION: ModernizationIcon,
  CLOUD_PLATFORM: CloudPlatformIcon,
  CONTINUOUS_ENGINEERING: ContinuousEngineeringIcon,
  CONNECTED_PRODUCT: ConnectedProductIcon,
  NEEDS_GUIDANCE: NeedsGuidanceIcon,
};

interface SolutionModelChooserProps {
  value: SolutionModel | "";
  error?: string;
  onChange: (value: SolutionModel) => void;
}

export function SolutionModelChooser({ value, error, onChange }: SolutionModelChooserProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{SOLUTION_MODEL_HEADING}</legend>
      <p className={`text-body ${styles.supporting}`}>{SOLUTION_MODEL_SUPPORTING}</p>
      <div className={styles.grid}>
        {SOLUTION_MODEL_OPTIONS.map((option, index) => {
          const Icon = ICONS[option.value];
          return (
            <SelectableCard
              key={option.value}
              name="solutionModel"
              value={option.value}
              checked={value === option.value}
              onChange={(v) => onChange(v as SolutionModel)}
              icon={<Icon />}
              label={option.label}
              description={option.description}
              accent={CARD_ACCENTS[index % CARD_ACCENTS.length]}
            />
          );
        })}
      </div>
      {error ? (
        <p role="alert" tabIndex={-1} className={styles.error}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
