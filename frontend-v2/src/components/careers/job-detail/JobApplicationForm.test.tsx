import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobApplicationForm } from "./JobApplicationForm";
import { localJobApplicationAdapter, type JobApplicationAdapter } from "@/lib/careers/application-adapter";
import { JOBS } from "@/lib/careers/jobs";

const ENGINEERING_JOB = JOBS.find((job) => job.team === "ENGINEERING")!;

function pdfFile(name = "resume.pdf") {
  return new File(["%PDF-1.4"], name, { type: "application/pdf" });
}

describe("JobApplicationForm", () => {
  it("shows the selected résumé filename after choosing a file", async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm job={ENGINEERING_JOB} onCancel={vi.fn()} adapter={localJobApplicationAdapter} />);

    const input = screen.getByLabelText(/resume/i);
    await user.upload(input, pdfFile("My Resume.pdf"));

    expect(await screen.findByText("My Resume.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("removing a selected résumé clears the filename and the Remove button", async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm job={ENGINEERING_JOB} onCancel={vi.fn()} adapter={localJobApplicationAdapter} />);

    await user.upload(screen.getByLabelText(/resume/i), pdfFile());
    expect(await screen.findByText("resume.pdf")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.queryByText("resume.pdf")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("shows a field error for a disallowed résumé type without submitting", async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm job={ENGINEERING_JOB} onCancel={vi.fn()} adapter={localJobApplicationAdapter} />);

    await user.type(screen.getByLabelText(/full name/i), "Priya Sharma");
    await user.type(screen.getByLabelText(/email address/i), "priya@example.com");
    await user.type(screen.getByLabelText(/phone number/i), "9876543210");
    await user.upload(screen.getByLabelText(/resume/i), new File(["x"], "resume.exe", { type: "application/x-msdownload" }));
    await user.click(screen.getByLabelText(/i consent to arooraa/i));
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText(/PDF, DOC or DOCX/i)).toBeInTheDocument();
  });

  it("submits the résumé file to the adapter alongside the rest of the payload", async () => {
    const adapter: JobApplicationAdapter = {
      submitApplication: vi.fn().mockResolvedValue({ ok: true, message: "Received.", applicationReference: "JOB-2026-000009" }),
    };
    const user = userEvent.setup();
    render(<JobApplicationForm job={ENGINEERING_JOB} onCancel={vi.fn()} adapter={adapter} />);

    await user.type(screen.getByLabelText(/full name/i), "Priya Sharma");
    await user.type(screen.getByLabelText(/email address/i), "priya@example.com");
    await user.type(screen.getByLabelText(/phone number/i), "9876543210");
    const file = pdfFile();
    await user.upload(screen.getByLabelText(/resume/i), file);
    await user.click(screen.getByLabelText(/i consent to arooraa/i));
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    await waitFor(() => expect(adapter.submitApplication).toHaveBeenCalledTimes(1));
    const [, resumeArg] = (adapter.submitApplication as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(resumeArg).toBe(file);
  });

  it("shows the application reference and role on success, never an internal id", async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm job={ENGINEERING_JOB} onCancel={vi.fn()} adapter={localJobApplicationAdapter} />);

    await user.type(screen.getByLabelText(/full name/i), "Priya Sharma");
    await user.type(screen.getByLabelText(/email address/i), "priya@example.com");
    await user.type(screen.getByLabelText(/phone number/i), "9876543210");
    await user.click(screen.getByLabelText(/i consent to arooraa/i));
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(await screen.findByText("Application received.")).toBeInTheDocument();
    expect(screen.getByText("JOB-2026-000001")).toBeInTheDocument();
    expect(screen.getAllByText(ENGINEERING_JOB.title).length).toBeGreaterThan(0);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });
});
