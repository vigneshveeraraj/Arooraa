import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LEAD_COPY } from "@/lib/lead-capture/copy";
import type { LeadCaptureAdapter, LeadCaptureResult } from "@/lib/lead-capture/types";
import { CampaignLeadForm } from "./CampaignLeadForm";

const en = LEAD_COPY.en;

function adapterReturning(...results: LeadCaptureResult[]) {
  const submit = vi.fn<LeadCaptureAdapter["submit"]>();
  for (const result of results) submit.mockResolvedValueOnce(result);
  return { submit };
}

function whatsappText(link: HTMLElement) {
  return new URL(link.getAttribute("href")!).searchParams.get("text") ?? "";
}

async function fillValidLead(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: en.requirements.WEBSITE }));
  await user.type(screen.getByLabelText(en.phoneLabel), "98765 43210");
  await user.click(screen.getByRole("checkbox", { name: en.consentLabel }));
}

describe("CampaignLeadForm", () => {
  it("asks for the requirement first, then only a phone number and an unticked consent", async () => {
    const user = userEvent.setup();
    render(<CampaignLeadForm locale="en" enabled adapter={adapterReturning()} />);

    expect(screen.queryByLabelText(en.phoneLabel)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: en.requirements.AI_AUTOMATION }));
    expect(screen.getByLabelText(en.phoneLabel)).toHaveAttribute("type", "tel");
    expect(screen.getByRole("checkbox", { name: en.consentLabel })).not.toBeChecked();
    expect(screen.queryByLabelText(/name|email|budget/i)).not.toBeInTheDocument();
    // Only the requirement, phone, consent and the off-screen honeypot.
    const inputs = [...document.querySelectorAll("input")].filter((input) => input.type !== "radio");
    expect(inputs.map((input) => input.type)).toEqual(["tel", "checkbox", "text"]);
  });

  it("explains each problem accessibly and focuses the first one, sending nothing", async () => {
    const user = userEvent.setup();
    const adapter = adapterReturning();
    render(<CampaignLeadForm locale="en" enabled adapter={adapter} />);

    // Nothing to submit until a requirement is chosen.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: en.requirements.WEBSITE }));
    const phone = screen.getByLabelText(en.phoneLabel);
    await user.type(phone, "5876543210");
    await user.click(screen.getByRole("button", { name: en.submit }));

    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(phone).toHaveAccessibleDescription(`${en.phoneHint} ${en.errors.phone}`);
    expect(phone).toHaveFocus();
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription(en.errors.consent);
    expect(adapter.submit).not.toHaveBeenCalled();
  });

  it("saves the lead before offering WhatsApp, with only the opaque reference in the message", async () => {
    const user = userEvent.setup();
    let resolve!: (result: LeadCaptureResult) => void;
    const submit = vi.fn<LeadCaptureAdapter["submit"]>(() => new Promise((done) => (resolve = done)));
    render(<CampaignLeadForm locale="en" enabled adapter={{ submit }} />);

    await fillValidLead(user);
    await user.click(screen.getByRole("button", { name: en.submit }));

    // Loading: nothing that leads to WhatsApp yet, and the button can't be pressed twice.
    expect(screen.getByRole("button", { name: en.submitting })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(en.submitting);
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).not.toBeInTheDocument();

    expect(submit).toHaveBeenCalledTimes(1);
    const [submission, key] = submit.mock.calls[0]!;
    expect(submission).toMatchObject({
      requirement: "WEBSITE",
      phone: "+919876543210",
      consent: true,
      consentText: en.consentLabel,
      sourceLocale: "en",
    });
    expect(key).toMatch(/^[0-9a-f-]{36}$/);

    resolve({ ok: true, leadReference: "LC-7Q2M9X" });
    const heading = await screen.findByRole("heading", { name: en.success.title });
    await vi.waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByText("LC-7Q2M9X")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: en.success.continueWhatsApp });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/918220503447\?text=/);
    expect(whatsappText(link)).toContain("Reference: LC-7Q2M9X");
    expect(link.getAttribute("href")).not.toMatch(/9876543210|98765/);
  });

  it("says plainly that nothing was saved when saving fails, and offers WhatsApp and a call", async () => {
    const user = userEvent.setup();
    render(<CampaignLeadForm locale="en" enabled adapter={adapterReturning({ ok: false, reason: "unavailable" })} />);

    await fillValidLead(user);
    await user.click(screen.getByRole("button", { name: en.submit }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(en.notSaved);
    expect(screen.queryByText(en.success.title)).not.toBeInTheDocument();
    const fallback = within(alert).getByRole("link", { name: en.fallbackWhatsApp });
    expect(whatsappText(fallback)).not.toMatch(/Reference|9876543210/);
    expect(within(alert).getByRole("link", { name: /\+91 82205 03447/ })).toHaveAttribute("href", "tel:+918220503447");
  });

  it("retries unchanged details with the same idempotency key, and edited details with a new one", async () => {
    const user = userEvent.setup();
    const adapter = adapterReturning(
      { ok: false, reason: "network" },
      { ok: false, reason: "network" },
      { ok: false, reason: "network" },
    );
    render(<CampaignLeadForm locale="en" enabled adapter={adapter} />);

    await fillValidLead(user);
    await user.click(screen.getByRole("button", { name: en.submit }));
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: en.submit }));
    await screen.findByRole("alert");
    await user.click(screen.getByRole("radio", { name: en.requirements.NOT_SURE }));
    await user.click(screen.getByRole("button", { name: en.submit }));
    await screen.findByRole("alert");

    const keys = adapter.submit.mock.calls.map(([, key]) => key);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).not.toBe(keys[0]);
  });

  it("sends nothing when the honeypot is filled", async () => {
    const user = userEvent.setup();
    const adapter = adapterReturning();
    const { container } = render(<CampaignLeadForm locale="en" enabled adapter={adapter} />);

    await fillValidLead(user);
    await user.type(container.querySelector<HTMLInputElement>('input[name="website"]')!, "spam");
    await user.click(screen.getByRole("button", { name: en.submit }));
    expect(adapter.submit).not.toHaveBeenCalled();
  });

  it("never asks for a number it cannot store while lead capture is not connected", async () => {
    const user = userEvent.setup();
    const adapter = adapterReturning();
    render(<CampaignLeadForm locale="ta" enabled={false} adapter={adapter} />);
    const ta = LEAD_COPY.ta;
    expect(screen.getByText(ta.introDirect)).toBeInTheDocument();
    expect(screen.queryByText(ta.intro)).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: ta.requirements.MARKETING_LEADS }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText(ta.unavailableNotice)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: ta.fallbackWhatsApp });
    expect(whatsappText(link)).toBe("வணக்கம் AROORAA, Marketing & Leads பற்றி free consultation வேண்டும்.");
    expect(adapter.submit).not.toHaveBeenCalled();
  });

  it("renders Tamil for the Tamil campaign, marked as Tamil", () => {
    const { container } = render(<CampaignLeadForm locale="ta" enabled adapter={adapterReturning()} />);
    expect(container.querySelector("form")).toHaveAttribute("lang", "ta");
    expect(screen.getByRole("group", { name: "உங்களுக்கு என்ன தேவை?" })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/-[஀-௿]/);
  });
});
