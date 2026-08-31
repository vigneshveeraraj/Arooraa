import type { ComponentType } from "react";
import { ENGAGEMENT_MODEL_HEADING, ENGAGEMENT_MODEL_OPTIONS } from "@/lib/content/start-project";
import type { EngagementModel } from "@/lib/start-project/types";
import { SelectableCard } from "./shared/SelectableCard";
import { CARD_ACCENTS } from "./accents";
import {
  AddAiAutomationIcon,
  ContinuousPartnerIcon,
  DesignBuildIcon,
  DiscoverDefineIcon,
  EngineeringCollaborationIcon,
  ImproveModernizeIcon,
  NeedsRecommendationIcon,
} from "./icons/EngagementModelIcons";
import styles from "./ModelChooser.module.css";

const ICONS: Record<EngagementModel, ComponentType> = {
  DISCOVER_DEFINE: DiscoverDefineIcon,
  DESIGN_BUILD: DesignBuildIcon,
  IMPROVE_MODERNIZE: ImproveModernizeIcon,
  ADD_AI_AUTOMATION: AddAiAutomationIcon,
  ENGINEERING_COLLABORATION: EngineeringCollaborationIcon,
  CONTINUOUS_PRODUCT_PARTNER: ContinuousPartnerIcon,
  NEEDS_RECOMMENDATION: NeedsRecommendationIcon,
};

interface EngagementModelChooserProps {
  value: EngagementModel | "";
  error?: string;
  onChange: (value: EngagementModel) => void;
}

export function EngagementModelChooser({ value, error, onChange }: EngagementModelChooserProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{ENGAGEMENT_MODEL_HEADING}</legend>
      <div className={styles.grid}>
        {ENGAGEMENT_MODEL_OPTIONS.map((option, index) => {
          const Icon = ICONS[option.value];
          return (
            <SelectableCard
              key={option.value}
              name="engagementModel"
              value={option.value}
              checked={value === option.value}
              onChange={(v) => onChange(v as EngagementModel)}
              icon={<Icon />}
              label={option.label}
              description={option.description}
              accent={CARD_ACCENTS[(index + 2) % CARD_ACCENTS.length]}
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
