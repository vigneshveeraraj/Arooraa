import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepSituation } from "./StepSituation";
import { EMPTY_FORM_VALUES } from "@/lib/start-project/types";

describe("StepSituation", () => {
  it("renders the problem textarea with writing prompts, stage, timeline and optional budget", () => {
    render(<StepSituation values={EMPTY_FORM_VALUES} errors={{}} setField={() => {}} toggleProductType={() => {}} />);
    expect(screen.getByLabelText(/What are you trying to build, improve or solve\?/)).toBeInTheDocument();
    expect(screen.getByText("Who experiences the problem?")).toBeInTheDocument();
    expect(screen.getByText("Where are you today?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Prototype / MVP" })).toBeInTheDocument();
    expect(screen.getByText("When would you like to move forward?")).toBeInTheDocument();
    expect(screen.getByText("Have you thought about investment/budget?")).toBeInTheDocument();
  });

  it("does not show the existing-system field for a brand-new-product solution model", () => {
    render(
      <StepSituation
        values={{ ...EMPTY_FORM_VALUES, solutionModel: "NEW_PRODUCT" }}
        errors={{}}
        setField={() => {}}
        toggleProductType={() => {}}
      />,
    );
    expect(screen.queryByText("Is there an existing product or system we should understand?")).not.toBeInTheDocument();
  });

  it("shows the existing-system field for solution models that involve one", () => {
    render(
      <StepSituation
        values={{ ...EMPTY_FORM_VALUES, solutionModel: "APPLICATION_MODERNIZATION" }}
        errors={{}}
        setField={() => {}}
        toggleProductType={() => {}}
      />,
    );
    expect(screen.getByText("Is there an existing product or system we should understand?")).toBeInTheDocument();
  });

  it("allows multiple product types to be selected", async () => {
    const user = userEvent.setup();
    const toggleProductType = vi.fn();
    render(<StepSituation values={EMPTY_FORM_VALUES} errors={{}} setField={() => {}} toggleProductType={toggleProductType} />);
    await user.click(screen.getByRole("checkbox", { name: "Web application" }));
    await user.click(screen.getByRole("checkbox", { name: "AI / Data" }));
    expect(toggleProductType).toHaveBeenCalledWith("WEB_APPLICATION");
    expect(toggleProductType).toHaveBeenCalledWith("AI_DATA");
  });

  it("shows field-level errors", () => {
    render(
      <StepSituation
        values={EMPTY_FORM_VALUES}
        errors={{ problemStatement: "Tell us what you're trying to build, improve or solve." }}
        setField={() => {}}
        toggleProductType={() => {}}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Tell us what you're trying to build/);
  });
});
