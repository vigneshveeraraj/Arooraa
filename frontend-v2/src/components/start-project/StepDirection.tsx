import type { EngagementModel, FormFieldErrors, SolutionModel } from "@/lib/start-project/types";
import { SolutionModelChooser } from "./SolutionModelChooser";
import { EngagementModelChooser } from "./EngagementModelChooser";

interface StepDirectionProps {
  solutionModel: SolutionModel | "";
  engagementModel: EngagementModel | "";
  errors: FormFieldErrors;
  onSolutionModelChange: (value: SolutionModel) => void;
  onEngagementModelChange: (value: EngagementModel) => void;
}

/**
 * Step 1 — Direction (W3.2A §5–8). Both choosers are shown together on one
 * screen rather than sequentially gated, so the visitor sees the whole
 * shape of Step 1 immediately (§8: "Do not require both selections before
 * the visitor can understand the rest of the form").
 */
export function StepDirection({ solutionModel, engagementModel, errors, onSolutionModelChange, onEngagementModelChange }: StepDirectionProps) {
  return (
    <div>
      <SolutionModelChooser value={solutionModel} error={errors.solutionModel} onChange={onSolutionModelChange} />
      <EngagementModelChooser value={engagementModel} error={errors.engagementModel} onChange={onEngagementModelChange} />
    </div>
  );
}
