import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "./page";

describe("Contact page", () => {
  it("renders the hero headline", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Let's start a conversation." })).toBeInTheDocument();
  });

  it("offers a clear redirect to Start a Project for high-intent visitors", () => {
    render(<ContactPage />);
    expect(screen.getByText("Have a product or engineering problem?")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Start a Project" })[0]).toHaveAttribute("href", "/start-project");
  });

  it("routes Careers intent to the Careers page rather than collecting résumés here", () => {
    render(<ContactPage />);
    expect(screen.getByText("Looking for an open role?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Careers" })).toHaveAttribute("href", "/careers");
    expect(screen.queryByLabelText(/resume/i)).not.toBeInTheDocument();
  });

  it("renders the contact form", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what's this about/i)).toBeInTheDocument();
  });

  it("never invents an office address, phone number, department email or support hours", () => {
    render(<ContactPage />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/\b\d{1,5}\s+\w+\s+(street|st\.|road|rd\.|avenue|ave\.)\b/i);
    expect(body).not.toMatch(/\+91[-\s]?\d{2,5}[-\s]?\d{5,8}/);
    expect(body).not.toMatch(/support@|sales@|hello@|info@/i);
    expect(body).not.toMatch(/\d{1,2}\s?(am|pm)\s?-\s?\d{1,2}\s?(am|pm)/i);
  });

  it("never asks for budget, timeline, project stage or engagement-model detail", () => {
    render(<ContactPage />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/budget/i);
    expect(body).not.toMatch(/timeline/i);
    expect(body).not.toMatch(/engagement model/i);
  });

  it("never exposes Marion among the product options", () => {
    render(<ContactPage />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/Marion/);
  });
});
