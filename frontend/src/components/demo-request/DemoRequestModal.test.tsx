import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoModalProvider } from "./DemoModalContext";
import { DemoRequestModal } from "./DemoRequestModal";
import { BookDemoButton } from "./BookDemoButton";

function renderHarness() {
  return render(
    <DemoModalProvider>
      <button type="button">Outside button</button>
      <BookDemoButton>Open demo modal</BookDemoButton>
      <DemoRequestModal />
    </DemoModalProvider>,
  );
}

async function openModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open demo modal" }));
  return screen.getByRole("dialog");
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Priya Sharma");
  await user.type(screen.getByLabelText("WhatsApp number"), "9876543210");
  await user.type(screen.getByLabelText("Business email"), "priya@spiceroute.example");
  await user.type(screen.getByLabelText("Restaurant name"), "Spice Route");
  await user.type(screen.getByLabelText("City"), "Chennai");
  await user.selectOptions(screen.getByLabelText("Number of outlets"), "ONE");
  await user.selectOptions(screen.getByLabelText("I'm interested in"), "kitchen-display");
  await user.selectOptions(screen.getByLabelText("Preferred contact method"), "whatsapp");
}

describe("DemoRequestModal", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is not present in the DOM until opened", () => {
    renderHarness();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens via the Book a Demo trigger and focuses the first field", async () => {
    const user = userEvent.setup();
    renderHarness();

    await openModal(user);

    expect(screen.getByLabelText("Full name")).toHaveFocus();
  });

  it("has an accessible dialog with a labelled heading and labelled controls", async () => {
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("heading", { name: "Book a Personalised Demo" })).toBeInTheDocument();

    for (const label of [
      "Full name",
      "WhatsApp number",
      "Business email",
      "Restaurant name",
      "City",
      "Number of outlets",
      "I'm interested in",
      "Preferred contact method",
      "Message (optional)",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("hides the honeypot field from real users and keeps it out of the tab order", async () => {
    const user = userEvent.setup();
    renderHarness();
    await openModal(user);

    const honeypot = screen.getByLabelText("Website", { selector: "input" });
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    renderHarness();
    await openModal(user);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open demo modal" })).toHaveFocus();
  });

  it("closes when clicking the backdrop but not when clicking inside the dialog", async () => {
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);

    await user.click(dialog);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const overlay = dialog.parentElement as HTMLElement;
    await user.click(overlay);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows required-field validation errors and does not submit when the form is empty", async () => {
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);

    await user.click(within(dialog).getByRole("button", { name: "Book a Demo" }));

    expect(await screen.findByText("Enter your name.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits successfully on 201 and shows the RECEIVED confirmation", async () => {
    fetchMock.mockResolvedValue({
      status: 201,
      json: async () => ({ requestId: "abc", status: "RECEIVED", message: "Thank you, we'll be in touch." }),
    });
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);
    await fillValidForm(user);

    await user.click(within(dialog).getByRole("button", { name: "Book a Demo" }));

    expect(await screen.findByText("Request received")).toBeInTheDocument();
    expect(screen.getByText("Thank you, we'll be in touch.")).toBeInTheDocument();
  });

  it("shows the ALREADY_RECEIVED confirmation on 200", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({ requestId: "abc", status: "ALREADY_RECEIVED", message: "We already have your request." }),
    });
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);
    await fillValidForm(user);

    await user.click(within(dialog).getByRole("button", { name: "Book a Demo" }));

    expect(await screen.findByText("Already on it")).toBeInTheDocument();
  });

  it("shows backend validation errors and preserves entered values on 400", async () => {
    fetchMock.mockResolvedValue({
      status: 400,
      json: async () => ({
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: { whatsappNumber: "Enter a valid Indian mobile number." },
      }),
    });
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);
    await fillValidForm(user);

    await user.click(within(dialog).getByRole("button", { name: "Book a Demo" }));

    expect(await screen.findByText("Enter a valid Indian mobile number.")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("Priya Sharma");
    expect(screen.getByLabelText("Restaurant name")).toHaveValue("Spice Route");
  });

  it("shows a rate-limit message on 429 and preserves entered values", async () => {
    fetchMock.mockResolvedValue({
      status: 429,
      json: async () => ({ code: "RATE_LIMITED", message: "Too many requests." }),
    });
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);
    await fillValidForm(user);

    await user.click(within(dialog).getByRole("button", { name: "Book a Demo" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/too many requests/i);
    expect(screen.getByLabelText("City")).toHaveValue("Chennai");
  });

  it("shows a generic message on network failure without leaking error internals", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);
    await fillValidForm(user);

    await user.click(within(dialog).getByRole("button", { name: "Book a Demo" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn't reach the server/i);
    expect(alert.textContent).not.toMatch(/TypeError|Failed to fetch/);
  });

  it("disables the submit button while a request is in progress", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    const user = userEvent.setup();
    renderHarness();
    const dialog = await openModal(user);
    await fillValidForm(user);

    const submitButton = within(dialog).getByRole("button", { name: "Book a Demo" });
    await user.click(submitButton);

    expect(await screen.findByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // finish the in-flight request so the test doesn't leak a pending promise
    resolveFetch({ status: 201, json: async () => ({ requestId: "x", status: "RECEIVED", message: "ok" }) });
    await waitFor(() => expect(screen.getByText("Request received")).toBeInTheDocument());
  });

  it("resets the form after an explicit cancel", async () => {
    const user = userEvent.setup();
    renderHarness();
    await openModal(user);
    await user.type(screen.getByLabelText("Full name"), "Priya Sharma");

    await user.keyboard("{Escape}");
    await openModal(user);

    expect(screen.getByLabelText("Full name")).toHaveValue("");
  });
});
