import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewStep } from "./ReviewStep";
import { EMPTY_FORM_VALUES } from "@/lib/start-project/types";

const FILLED = {
  ...EMPTY_FORM_VALUES,
  solutionModel: "AI_DATA_AUTOMATION" as const,
  engagementModel: "DISCOVER_DEFINE" as const,
  problemStatement:
    "Our support team re-keys the same customer data across three different internal tools every single day of the week, which wastes hours and introduces mistakes that customers eventually notice.",
  projectStage: "EXPLORING" as const,
  timeline: "WITHIN_1_TO_3_MONTHS" as const,
  name: "Priya Sharma",
  email: "priya@example.com",
  country: "IN",
  phone: "9876543210",
  preferredContactMethod: "PHONE" as const,
};

describe("ReviewStep", () => {
  it("reflects the visitor's selections in the summary", () => {
    render(<ReviewStep values={FILLED} submission={{ status: "idle" }} onEdit={() => {}} onSubmit={() => {}} />);
    expect(screen.getByText("AI, Data or Automation")).toBeInTheDocument();
    expect(screen.getByText("Discover & Define")).toBeInTheDocument();
    expect(screen.getByText("Exploring")).toBeInTheDocument();
    expect(screen.getByText("Within 1–3 months")).toBeInTheDocument();
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    expect(screen.getByText("priya@example.com")).toBeInTheDocument();
    expect(screen.getByText("+91 9876543210")).toBeInTheDocument();
    expect(screen.getAllByText("Phone").length).toBeGreaterThan(0);
  });

  it("does not repeat the entire problem statement verbatim", () => {
    render(<ReviewStep values={FILLED} submission={{ status: "idle" }} onEdit={() => {}} onSubmit={() => {}} />);
    const text = document.body.textContent ?? "";
    expect(text).not.toContain(FILLED.problemStatement);
  });

  it("calls onEdit with the right step when an Edit link is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ReviewStep values={FILLED} submission={{ status: "idle" }} onEdit={onEdit} onSubmit={() => {}} />);
    const editLinks = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editLinks[2]!); // Contact section
    expect(onEdit).toHaveBeenCalledWith(2);
  });

  it("shows a loading label and disables the button while submitting", () => {
    render(<ReviewStep values={FILLED} submission={{ status: "submitting" }} onEdit={() => {}} onSubmit={() => {}} />);
    const button = screen.getByRole("button", { name: "Sending your enquiry…" });
    expect(button).toBeDisabled();
  });

  it("shows a recoverable error banner without losing the review content, and offers Try Again", () => {
    render(<ReviewStep values={FILLED} submission={{ status: "error", message: "Network error" }} onEdit={() => {}} onSubmit={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't send the enquiry/i);
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("re-attempts submission when Try Again is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ReviewStep values={FILLED} submission={{ status: "error", message: "Network error" }} onEdit={() => {}} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Try Again" }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("does not promise a fast/guaranteed response time", () => {
    render(<ReviewStep values={FILLED} submission={{ status: "idle" }} onEdit={() => {}} onSubmit={() => {}} />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/within (5|15|30) minutes/i);
    expect(text).not.toMatch(/24\/7/i);
    expect(text).not.toMatch(/same[- ]day/i);
  });

  it("calls onSubmit when Submit Project is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ReviewStep values={FILLED} submission={{ status: "idle" }} onEdit={() => {}} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Submit Project" }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
