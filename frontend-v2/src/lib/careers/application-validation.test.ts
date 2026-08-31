import { describe, expect, it } from "vitest";
import { validateJobApplicationForm } from "./application-validation";
import { EMPTY_JOB_APPLICATION_VALUES, type JobApplicationFormValues } from "./application-types";

const VALID_VALUES: JobApplicationFormValues = {
  ...EMPTY_JOB_APPLICATION_VALUES,
  fullName: "Priya Sharma",
  email: "priya@example.com",
  phone: "+919876543210",
  consent: true,
};

describe("validateJobApplicationForm", () => {
  it("passes with only the required fields filled and no résumé", () => {
    expect(validateJobApplicationForm(VALID_VALUES, null)).toEqual({});
  });

  it("requires full name, email, phone and consent", () => {
    const errors = validateJobApplicationForm(EMPTY_JOB_APPLICATION_VALUES, null);
    expect(errors.fullName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.consent).toBeTruthy();
  });

  it("rejects an invalid email", () => {
    const errors = validateJobApplicationForm({ ...VALID_VALUES, email: "not-an-email" }, null);
    expect(errors.email).toBeTruthy();
  });

  it("accepts a valid PDF résumé", () => {
    const file = new File(["%PDF-1.4"], "resume.pdf", { type: "application/pdf" });
    expect(validateJobApplicationForm(VALID_VALUES, file).resume).toBeUndefined();
  });

  it("rejects a résumé with a disallowed type", () => {
    const file = new File(["not a resume"], "resume.exe", { type: "application/x-msdownload" });
    const errors = validateJobApplicationForm(VALID_VALUES, file);
    expect(errors.resume).toMatch(/PDF, DOC or DOCX/i);
  });

  it("rejects an oversized résumé", () => {
    const oversized = new File([new Uint8Array(6 * 1024 * 1024)], "resume.pdf", { type: "application/pdf" });
    const errors = validateJobApplicationForm(VALID_VALUES, oversized);
    expect(errors.resume).toMatch(/smaller than 5\s?MB/i);
  });
});
