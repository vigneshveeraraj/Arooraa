import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";
import { localContactAdapter, notConnectedContactAdapter, type ContactAdapter } from "@/lib/contact/adapter";

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>, reason = "General enquiry") {
  await user.type(screen.getByLabelText(/^name/i), "Priya Sharma");
  await user.type(screen.getByLabelText(/email address/i), "priya@example.com");
  await user.selectOptions(screen.getByLabelText(/what's this about/i), reason);
  await user.type(screen.getByLabelText(/^message/i), "I have a question about AROORAA as a company.");
}

describe("ContactForm", () => {
  it("renders the required fields and the optional phone/company fields", () => {
    render(<ContactForm adapter={localContactAdapter} />);
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what's this about/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
  });

  it("never shows a product field until Product question is selected", async () => {
    const user = userEvent.setup();
    render(<ContactForm adapter={localContactAdapter} />);

    expect(screen.queryByLabelText(/which product/i)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/what's this about/i), "Product question");
    expect(screen.getByLabelText(/which product/i)).toBeInTheDocument();
  });

  it("clears a previously chosen product when the reason changes away from Product question", async () => {
    const user = userEvent.setup();
    render(<ContactForm adapter={localContactAdapter} />);

    await user.selectOptions(screen.getByLabelText(/what's this about/i), "Product question");
    await user.selectOptions(screen.getByLabelText(/which product/i), "MESA");
    await user.selectOptions(screen.getByLabelText(/what's this about/i), "General enquiry");

    expect(screen.queryByLabelText(/which product/i)).not.toBeInTheDocument();
  });

  it("never forces a product selection for a non-product reason", async () => {
    const user = userEvent.setup();
    render(<ContactForm adapter={localContactAdapter} />);
    await fillRequiredFields(user, "Partnership");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
  });

  it("shows validation errors for a fully empty submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm adapter={localContactAdapter} />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Choose what this is about.")).toBeInTheDocument();
    expect(screen.getByText("Enter your message.")).toBeInTheDocument();
  });

  it("disables the submit button while submitting, preventing a double submit", async () => {
    let resolveSubmit: (value: { ok: true; message: string }) => void = () => {};
    const adapter: ContactAdapter = {
      submit: vi.fn(() => new Promise<{ ok: true; message: string }>((resolve) => (resolveSubmit = resolve))),
    };
    const user = userEvent.setup();
    render(<ContactForm adapter={adapter} />);
    await fillRequiredFields(user);

    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    resolveSubmit({ ok: true, message: "Received." });
    await waitFor(() => expect(adapter.submit).toHaveBeenCalledTimes(1));
  });

  it("shows the reference on success, never an internal id", async () => {
    const user = userEvent.setup();
    render(<ContactForm adapter={localContactAdapter} />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Message received.")).toBeInTheDocument();
    expect(screen.getByText("CNT-2026-000001")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start a project/i })).toHaveAttribute("href", "/start-project");
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it("shows an honest error, never a fake success, when the backend isn't connected", async () => {
    const user = userEvent.setup();
    render(<ContactForm adapter={notConnectedContactAdapter} />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/isn't connected/i);
    expect(screen.queryByText("Message received.")).not.toBeInTheDocument();
  });

  it("preserves entered values after a server error", async () => {
    const adapter: ContactAdapter = { submit: vi.fn().mockResolvedValue({ ok: false, message: "Something went wrong." }) };
    const user = userEvent.setup();
    render(<ContactForm adapter={adapter} />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await screen.findByRole("alert");
    expect(screen.getByLabelText(/^name/i)).toHaveValue("Priya Sharma");
    expect(screen.getByLabelText(/^message/i)).toHaveValue("I have a question about AROORAA as a company.");
  });

  it("maps a network failure to an honest error without losing the entered message", async () => {
    const adapter: ContactAdapter = { submit: vi.fn().mockResolvedValue({ ok: false, message: "We couldn't reach AROORAA." }) };
    const user = userEvent.setup();
    render(<ContactForm adapter={adapter} />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/couldn't reach/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toHaveValue("Priya Sharma");
  });
});
