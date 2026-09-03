import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobApplyPanel } from "./JobApplyPanel";
import { localJobApplicationAdapter, notConnectedJobApplicationAdapter } from "@/lib/careers/application-adapter";
import { JOBS } from "@/lib/careers/jobs";
import type { JobOpening } from "@/lib/careers/types";

/**
 * Fills a field in one go rather than a keystroke at a time. Same reason as ContactForm's helper:
 * simulating forty keystrokes re-renders and re-validates the form forty times, which is what made
 * these tests time out under a fully parallel suite while passing on their own. Nothing here is
 * about what happens between keystrokes.
 */
async function fill(user: ReturnType<typeof userEvent.setup>, element: HTMLElement, text: string) {
  await user.click(element);
  await user.paste(text);
}

const OPEN_JOB = JOBS[0]!;
const PLANNED_JOB: JobOpening = { ...OPEN_JOB, status: "PLANNED" };
const CLOSED_JOB: JobOpening = { ...OPEN_JOB, status: "CLOSED" };

describe("JobApplyPanel", () => {
  it("shows the planning notice immediately for a PLANNED role, with no network call", () => {
    render(<JobApplyPanel job={PLANNED_JOB} />);
    expect(screen.getByText("This role is in the planning stage.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /join job alerts/i })).toBeInTheDocument();
  });

  it("shows the closed notice for a CLOSED role", () => {
    render(<JobApplyPanel job={CLOSED_JOB} />);
    expect(screen.getByText("This role is no longer accepting applications.")).toBeInTheDocument();
  });

  it("reveals the full application form for an OPEN role when Apply is clicked", async () => {
    const user = userEvent.setup();
    render(<JobApplyPanel job={OPEN_JOB} />);

    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /apply for this role/i }));

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it("reports an honest error, never a fake success, when the adapter can't reach a hiring workflow", async () => {
    const user = userEvent.setup();
    render(<JobApplyPanel job={OPEN_JOB} adapter={notConnectedJobApplicationAdapter} />);

    await user.click(screen.getByRole("button", { name: /apply for this role/i }));
    await fill(user, screen.getByLabelText(/full name/i), "Priya Sharma");
    await fill(user, screen.getByLabelText(/email address/i), "priya@example.com");
    await fill(user, screen.getByLabelText(/phone number/i), "9876543210");
    await user.click(screen.getByLabelText(/i consent to arooraa/i));
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText(/aren't connected to a hiring workflow yet/i)).toBeInTheDocument();
    expect(screen.queryByText("Application received.")).not.toBeInTheDocument();
  });

  it("blocks submission without required fields and consent", async () => {
    const user = userEvent.setup();
    render(<JobApplyPanel job={OPEN_JOB} />);

    await user.click(screen.getByRole("button", { name: /apply for this role/i }));
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter a phone number.")).toBeInTheDocument();
    expect(screen.getByText(/please confirm you consent/i)).toBeInTheDocument();
  });

  it("only shows the portfolio/GitHub field for engineering, AI and design roles", async () => {
    const user = userEvent.setup();
    const salesJob = JOBS.find((job) => job.team === "SALES")!;
    render(<JobApplyPanel job={salesJob} />);

    await user.click(screen.getByRole("button", { name: /apply for this role/i }));
    expect(screen.queryByLabelText(/portfolio or github/i)).not.toBeInTheDocument();
  });

  it("shows the real success state — reference and role — when the application is accepted", async () => {
    const user = userEvent.setup();
    render(<JobApplyPanel job={OPEN_JOB} adapter={localJobApplicationAdapter} />);

    await user.click(screen.getByRole("button", { name: /apply for this role/i }));
    await fill(user, screen.getByLabelText(/full name/i), "Priya Sharma");
    await fill(user, screen.getByLabelText(/email address/i), "priya@example.com");
    await fill(user, screen.getByLabelText(/phone number/i), "9876543210");
    await user.click(screen.getByLabelText(/i consent to arooraa/i));
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText("Application received.")).toBeInTheDocument();
    expect(screen.getByText("JOB-2026-000001")).toBeInTheDocument();
    expect(screen.getAllByText(OPEN_JOB.title).length).toBeGreaterThan(0);
    expect(screen.getByText(/we'll be in touch at priya@example.com/i)).toBeInTheDocument();
  });
});
