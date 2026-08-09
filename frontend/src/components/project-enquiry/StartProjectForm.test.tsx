import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartProjectForm } from "./StartProjectForm";

async function fillStep0(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText("I'm looking for"), "CUSTOM_SOFTWARE");
  await user.click(screen.getByRole("button", { name: "Next" }));
}

async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText("Project type"), "NEW_PRODUCT");
  await user.type(
    screen.getByLabelText("Tell us about your idea or business problem"),
    "We need a logistics tracking platform for our operations across five cities.",
  );
  await user.selectOptions(screen.getByLabelText("Does this involve an existing system?"), "no");
  await user.click(screen.getByRole("button", { name: "Next" }));
}

async function fillStep2(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText("Budget range"), "FROM_2L_TO_5L");
  await user.selectOptions(screen.getByLabelText("Timeline"), "FROM_1_TO_3_MONTHS");
  await user.click(screen.getByRole("button", { name: "Next" }));
}

async function fillStep3(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Your name"), "Arun Kumar");
  await user.type(screen.getByLabelText("Business email"), "arun@example.com");
  await user.type(screen.getByLabelText("Phone"), "+919876543210");
  await user.type(screen.getByLabelText("Country"), "India");
  await user.selectOptions(screen.getByLabelText("Preferred contact method"), "PHONE");
}

async function fillAllStepsUpToContact(user: ReturnType<typeof userEvent.setup>) {
  await fillStep0(user);
  await fillStep1(user);
  await fillStep2(user);
}

describe("StartProjectForm", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders step 1 first, with a labelled control and no submit button yet", () => {
    render(<StartProjectForm />);
    expect(screen.getByLabelText("I'm looking for")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit Enquiry" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("blocks advancing past step 1 until a service is chosen", async () => {
    const user = userEvent.setup();
    render(<StartProjectForm />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Choose what you need help with.")).toBeInTheDocument();
    expect(screen.getByLabelText("I'm looking for")).toBeInTheDocument();
  });

  it("moves through all four steps and preserves values going back", async () => {
    const user = userEvent.setup();
    render(<StartProjectForm />);

    await fillAllStepsUpToContact(user);
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Budget range")).toHaveValue("FROM_2L_TO_5L");

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Project type")).toHaveValue("NEW_PRODUCT");

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("I'm looking for")).toHaveValue("CUSTOM_SOFTWARE");
  });

  it("hides the honeypot field from real users and keeps it out of the tab order", () => {
    render(<StartProjectForm />);
    const honeypot = screen.getByLabelText("Website", { selector: "input" });
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("submits successfully on 201 and shows the enquiry number", async () => {
    fetchMock.mockResolvedValue({
      status: 201,
      json: async () => ({
        enquiryId: "abc",
        enquiryNumber: "ARO-2026-000123",
        status: "RECEIVED",
        message: "Your project enquiry has been received.",
      }),
    });
    const user = userEvent.setup();
    render(<StartProjectForm />);

    await fillAllStepsUpToContact(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

    expect(await screen.findByText("Enquiry received")).toBeInTheDocument();
    expect(screen.getByText("ARO-2026-000123")).toBeInTheDocument();
  });

  it("shows the ALREADY_RECEIVED confirmation on 200", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({
        enquiryId: "abc",
        enquiryNumber: "ARO-2026-000123",
        status: "ALREADY_RECEIVED",
        message: "We already received this enquiry.",
      }),
    });
    const user = userEvent.setup();
    render(<StartProjectForm />);

    await fillAllStepsUpToContact(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

    expect(await screen.findByText("Already on it")).toBeInTheDocument();
  });

  it("on a 400 field error for an earlier step, jumps back to that step and preserves values", async () => {
    fetchMock.mockResolvedValue({
      status: 400,
      json: async () => ({
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: { description: "must be at least 20 characters" },
      }),
    });
    const user = userEvent.setup();
    render(<StartProjectForm />);

    await fillAllStepsUpToContact(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

    expect(await screen.findByText("must be at least 20 characters")).toBeInTheDocument();
    expect(screen.getByLabelText("Tell us about your idea or business problem")).toHaveValue(
      "We need a logistics tracking platform for our operations across five cities.",
    );
  });

  it("shows a rate-limit message on 429 and preserves entered values", async () => {
    fetchMock.mockResolvedValue({
      status: 429,
      json: async () => ({ code: "RATE_LIMITED", message: "Too many requests." }),
    });
    const user = userEvent.setup();
    render(<StartProjectForm />);

    await fillAllStepsUpToContact(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/too many requests/i);
    expect(screen.getByLabelText("Your name")).toHaveValue("Arun Kumar");
  });

  it("shows a generic message on network failure without leaking error internals", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    render(<StartProjectForm />);

    await fillAllStepsUpToContact(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

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
    render(<StartProjectForm />);

    await fillAllStepsUpToContact(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

    expect(await screen.findByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({
      status: 201,
      json: async () => ({ enquiryId: "x", enquiryNumber: "ARO-2026-000001", status: "RECEIVED", message: "ok" }),
    });
    await waitFor(() => expect(screen.getByText("Enquiry received")).toBeInTheDocument());
  });
});
