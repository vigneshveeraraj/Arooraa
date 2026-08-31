import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartProjectForm } from "./StartProjectForm";
import type { AdapterResult, ProjectEnquiryAdapter } from "@/lib/start-project/adapter";
import { clearDraft } from "@/lib/start-project/session-draft";

// This file's multi-step, multi-click traversals occasionally exceed
// Vitest's 5s default when the full suite runs under heavy parallel load
// (individually they finish in well under a second) — a generous file-local
// timeout avoids that flakiness without touching the project-wide config.
vi.setConfig({ testTimeout: 15000 });

function successAdapter(): ProjectEnquiryAdapter {
  return { submit: vi.fn(async (): Promise<AdapterResult> => ({ ok: true, message: "Received." })) };
}

function failingAdapter(message = "We couldn't reach the server."): ProjectEnquiryAdapter {
  return { submit: vi.fn(async (): Promise<AdapterResult> => ({ ok: false, message })) };
}

async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: /AI, Data or Automation/ }));
  await user.click(screen.getByRole("radio", { name: /Discover & Define/ }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function fillStep2(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText(/What are you trying to build, improve or solve\?/),
    "Our support team re-keys the same customer data across three different tools every day.",
  );
  await user.click(screen.getByRole("radio", { name: "Exploring" }));
  await user.click(screen.getByRole("radio", { name: "Within 1–3 months" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function fillStep3(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Full name/), "Priya Sharma");
  await user.type(screen.getByLabelText(/Email address/), "priya@example.com");
  await user.selectOptions(screen.getByLabelText(/Country/), "IN");
  await user.type(screen.getByLabelText(/Phone number/), "9876543210");
  await user.click(screen.getByRole("radio", { name: "Email" }));
  await user.click(screen.getByRole("button", { name: "Review Your Enquiry" }));
}

beforeEach(() => {
  clearDraft();
});

afterEach(() => {
  clearDraft();
});

describe("StartProjectForm — step behavior", () => {
  it("starts on Step 1 (Direction) with the progress indicator visible", () => {
    render(<StartProjectForm adapter={successAdapter()} />);
    expect(screen.getByRole("heading", { level: 2, name: "Choose the direction" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Form progress" })).toBeInTheDocument();
  });

  it("blocks progression until both a solution model and an engagement model are chosen", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { level: 2, name: "Choose the direction" })).toBeInTheDocument();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });

  it("lets a visitor choose Needs Guidance / Needs Recommendation and still proceed", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await user.click(screen.getByRole("radio", { name: /I Have a Problem — Help Me Find the Direction/ }));
    await user.click(screen.getByRole("radio", { name: /Recommend the Right Model/ }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { level: 2, name: "Tell us about the situation" })).toBeInTheDocument();
  });

  it("preserves Step 1 selections when moving forward and back", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("radio", { name: /AI, Data or Automation/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Discover & Define/ })).toBeChecked();
  });

  it("moves through all three steps to the review screen", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    expect(screen.getByText("Your project enquiry")).toBeInTheDocument();
  }, 15000);
});

describe("StartProjectForm — problem/context", () => {
  it("requires the problem statement, stage and timeline before continuing", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { level: 2, name: "Tell us about the situation" })).toBeInTheDocument();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });

  it("shows the existing-system field only for solution models that involve one", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await user.click(screen.getByRole("radio", { name: /Modernize an Existing System/ }));
    await user.click(screen.getByRole("radio", { name: /Improve & Modernize/ }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Is there an existing product or system we should understand?")).toBeInTheDocument();
  });
});

describe("StartProjectForm — contact", () => {
  it("requires name, email, phone and a preferred contact method", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await user.click(screen.getByRole("button", { name: "Review Your Enquiry" }));
    expect(screen.getByRole("heading", { level: 2, name: "How can we reach you?" })).toBeInTheDocument();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  }, 15000);

  it("never pre-selects WhatsApp consent and blocks progression until it's given", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await user.type(screen.getByLabelText(/Full name/), "Priya Sharma");
    await user.type(screen.getByLabelText(/Email address/), "priya@example.com");
    await user.selectOptions(screen.getByLabelText(/Country/), "IN");
    await user.type(screen.getByLabelText(/Phone number/), "9876543210");
    await user.click(screen.getByRole("radio", { name: "WhatsApp" }));
    const consent = screen.getByRole("checkbox", { name: /AROORAA may contact me about this enquiry using WhatsApp/ });
    expect(consent).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Review Your Enquiry" }));
    expect(screen.getByRole("heading", { level: 2, name: "How can we reach you?" })).toBeInTheDocument();
    await user.click(consent);
    await user.click(screen.getByRole("button", { name: "Review Your Enquiry" }));
    expect(screen.getByText("Your project enquiry")).toBeInTheDocument();
  }, 15000);
});

describe("StartProjectForm — review", () => {
  it("lets the visitor edit a specific section from the review screen without losing other values", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButtons[2]!); // Contact section
    expect(screen.getByRole("heading", { level: 2, name: "How can we reach you?" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/)).toHaveValue("Priya Sharma");
  }, 15000);
});

describe("StartProjectForm — submission", () => {
  it("shows a loading state and disables the submit button while submitting", async () => {
    const user = userEvent.setup({ delay: null });
    let resolveSubmit!: (value: AdapterResult) => void;
    const adapter: ProjectEnquiryAdapter = {
      submit: vi.fn(() => new Promise<AdapterResult>((resolve) => (resolveSubmit = resolve))),
    };
    render(<StartProjectForm adapter={adapter} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Project" }));
    const submitting = screen.getByRole("button", { name: "Sending your enquiry…" });
    expect(submitting).toBeDisabled();
    resolveSubmit({ ok: true, message: "Received." });
  }, 15000);

  it("shows the full success state after a successful submission", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Project" }));
    expect(await screen.findByRole("heading", { level: 2, name: "We've received your project enquiry." })).toBeInTheDocument();
  }, 15000);

  it("shows a recoverable error and retains every value on failure", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={failingAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Project" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't send the enquiry/i);
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    expect(screen.getByText("priya@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  }, 15000);

  it("does not submit when the honeypot field has a value", async () => {
    const user = userEvent.setup({ delay: null });
    const adapter = successAdapter();
    render(<StartProjectForm adapter={adapter} />);
    await fillStep1(user);
    await fillStep2(user);

    // Fill the honeypot while it's still mounted (Step 3) — its value lives
    // in form state and is still checked at submit time from the review screen.
    await user.type(screen.getByLabelText(/Full name/), "Priya Sharma");
    await user.type(screen.getByLabelText(/Email address/), "priya@example.com");
    await user.selectOptions(screen.getByLabelText(/Country/), "IN");
    await user.type(screen.getByLabelText(/Phone number/), "9876543210");
    await user.click(screen.getByRole("radio", { name: "Email" }));
    await user.type(screen.getByLabelText("Website", { selector: "input" }), "http://spam.example");
    await user.click(screen.getByRole("button", { name: "Review Your Enquiry" }));

    await user.click(screen.getByRole("button", { name: "Submit Project" }));

    expect(adapter.submit).not.toHaveBeenCalled();
    expect(screen.getByText("Your project enquiry")).toBeInTheDocument();
  }, 15000);
});

describe("StartProjectForm — context-aware copy", () => {
  afterEach(() => {
    Object.defineProperty(document, "referrer", { value: "", configurable: true });
  });

  it("shows a restrained acknowledgment when arriving from a known product page, without forcing a solution model", () => {
    Object.defineProperty(document, "referrer", { value: `${window.location.origin}/products/smart-mirror`, configurable: true });
    render(<StartProjectForm adapter={successAdapter()} />);
    expect(screen.getByText(/connected experiences or ambient computing/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /AI, Data or Automation/ })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /Build a New Product/ })).not.toBeChecked();
  });

  it("shows no context note for a visitor with no known referrer", () => {
    render(<StartProjectForm adapter={successAdapter()} />);
    expect(screen.queryByText(/connected experiences or ambient computing/i)).not.toBeInTheDocument();
  });
});

describe("StartProjectForm — draft persistence (W3.2A.1 §24 scenarios)", () => {
  it("Scenario A: Direction selections survive Step 1 → Step 2 → Back", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("radio", { name: /AI, Data or Automation/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Discover & Define/ })).toBeChecked();
  });

  it("Scenario B: the problem statement survives Step 2 → Step 3 → Back", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await user.type(
      screen.getByLabelText(/What are you trying to build, improve or solve\?/),
      "PERSISTENCE TEST — RESTORE THIS TEXT",
    );
    await user.click(screen.getByRole("radio", { name: "Exploring" }));
    await user.click(screen.getByRole("radio", { name: "Within 1–3 months" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText(/What are you trying to build, improve or solve\?/)).toHaveValue(
      "PERSISTENCE TEST — RESTORE THIS TEXT",
    );
  });

  it("Scenario C: an unmounted-and-remounted /start-project (route navigation) restores the draft", async () => {
    const user = userEvent.setup({ delay: null });
    const { unmount } = render(<StartProjectForm adapter={successAdapter()} />);
    await user.click(screen.getByRole("radio", { name: /AI, Data or Automation/ }));
    await user.click(screen.getByRole("radio", { name: /Discover & Define/ }));
    unmount();

    render(<StartProjectForm adapter={successAdapter()} />);
    expect(screen.getByRole("radio", { name: /AI, Data or Automation/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Discover & Define/ })).toBeChecked();
  });

  it("Scenario D: a fresh mount in the same session (refresh) restores the draft, including which step to resume on", async () => {
    const user = userEvent.setup({ delay: null });
    const { unmount } = render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await user.type(
      screen.getByLabelText(/What are you trying to build, improve or solve\?/),
      "PERSISTENCE TEST — RESTORE THIS TEXT",
    );
    unmount();

    render(<StartProjectForm adapter={successAdapter()} />);
    expect(screen.getByRole("heading", { level: 2, name: "Tell us about the situation" })).toBeInTheDocument();
    expect(screen.getByLabelText(/What are you trying to build, improve or solve\?/)).toHaveValue(
      "PERSISTENCE TEST — RESTORE THIS TEXT",
    );
    expect(screen.getByText("Your unfinished project enquiry has been restored.")).toBeInTheDocument();
  });

  it("Scenario E: editing Contact from Review and returning leaves Direction/Situation data intact", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButtons[2]!); // Contact section
    await user.click(screen.getByRole("button", { name: "Review Your Enquiry" }));

    expect(screen.getByText("Your project enquiry")).toBeInTheDocument();
    expect(screen.getByText("AI, Data or Automation")).toBeInTheDocument();
    expect(screen.getByText("Discover & Define")).toBeInTheDocument();
    expect(screen.getByText("Exploring")).toBeInTheDocument();
  }, 15000);

  it("Scenario F: a successful submission clears the draft", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={successAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Project" }));
    await screen.findByRole("heading", { level: 2, name: "We've received your project enquiry." });
    expect(window.sessionStorage.getItem("arooraa:start-project:draft:v1")).toBeNull();
  }, 15000);

  it("Scenario G: a failed submission retains the draft", async () => {
    const user = userEvent.setup({ delay: null });
    render(<StartProjectForm adapter={failingAdapter()} />);
    await fillStep1(user);
    await fillStep2(user);
    await fillStep3(user);
    await user.click(screen.getByRole("button", { name: "Submit Project" }));
    await screen.findByRole("alert");
    const raw = window.sessionStorage.getItem("arooraa:start-project:draft:v1");
    expect(raw).not.toBeNull();
    expect(raw).toContain("Priya Sharma");
  }, 15000);
});
