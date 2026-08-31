import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepContact } from "./StepContact";
import { EMPTY_FORM_VALUES } from "@/lib/start-project/types";

describe("StepContact", () => {
  it("requires full name, email and phone with real labels", () => {
    render(<StepContact values={EMPTY_FORM_VALUES} errors={{}} setField={() => {}} />);
    expect(screen.getByLabelText(/Full name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone number/)).toBeInTheDocument();
  });

  it("does not show WhatsApp consent unless WhatsApp is the preferred method", () => {
    render(<StepContact values={{ ...EMPTY_FORM_VALUES, preferredContactMethod: "EMAIL" }} errors={{}} setField={() => {}} />);
    expect(screen.queryByText(/AROORAA may contact me about this enquiry using WhatsApp/)).not.toBeInTheDocument();
  });

  it("shows WhatsApp consent, unchecked by default, once WhatsApp is chosen", () => {
    render(<StepContact values={{ ...EMPTY_FORM_VALUES, preferredContactMethod: "WHATSAPP" }} errors={{}} setField={() => {}} />);
    const consent = screen.getByRole("checkbox", { name: /AROORAA may contact me about this enquiry using WhatsApp/ });
    expect(consent).toBeInTheDocument();
    expect(consent).not.toBeChecked();
  });

  it("calls setField when the WhatsApp consent checkbox is toggled", async () => {
    const user = userEvent.setup();
    const setField = vi.fn();
    render(<StepContact values={{ ...EMPTY_FORM_VALUES, preferredContactMethod: "WHATSAPP" }} errors={{}} setField={setField} />);
    await user.click(screen.getByRole("checkbox", { name: /AROORAA may contact me about this enquiry using WhatsApp/ }));
    expect(setField).toHaveBeenCalledWith("whatsappConsent", true);
  });

  it("renders a hidden honeypot field", () => {
    render(<StepContact values={EMPTY_FORM_VALUES} errors={{}} setField={() => {}} />);
    const honeypot = screen.getByLabelText("Website", { selector: "input" });
    expect(honeypot).toHaveAttribute("tabIndex", "-1");
  });

  it("renders the trust/privacy note and the sensitive-data warning", () => {
    render(<StepContact values={EMPTY_FORM_VALUES} errors={{}} setField={() => {}} />);
    expect(screen.getByText("What you share is used to understand and respond to your project enquiry.")).toBeInTheDocument();
    expect(screen.getByText(/do not include passwords, API keys, credentials/i)).toBeInTheDocument();
  });

  it("offers role suggestions without forcing a fixed category", () => {
    const { container } = render(<StepContact values={EMPTY_FORM_VALUES} errors={{}} setField={() => {}} />);
    const roleInput = screen.getByLabelText("Role / Responsibility");
    expect(roleInput.tagName).toBe("INPUT");
    // <option> inside a <datalist> isn't exposed with role="option" in jsdom,
    // so this checks the datalist's own suggestion list directly.
    expect(container.querySelector('option[value="Founder"]')).not.toBeNull();
  });
});
