import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuccessState } from "./SuccessState";
import { EMPTY_FORM_VALUES } from "@/lib/start-project/types";

const VALUES = {
  ...EMPTY_FORM_VALUES,
  email: "priya@example.com",
  country: "IN",
  phone: "9876543210",
  preferredContactMethod: "PHONE" as const,
};

describe("SuccessState", () => {
  it("shows a complete success experience, not a generic thank-you", () => {
    render(
      <SuccessState
        values={VALUES}
        submission={{ status: "success", message: "AROORAA now has the context you shared." }}
        onStartOver={() => {}}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "We've received your project enquiry." })).toBeInTheDocument();
    expect(screen.getByText("AROORAA now has the context you shared.")).toBeInTheDocument();
    expect(screen.getByText("What happens next")).toBeInTheDocument();
    expect(screen.getByText("Enquiry received")).toBeInTheDocument();
  });

  it("echoes the contact email in full, as its own element separate from the phone", () => {
    render(<SuccessState values={VALUES} submission={{ status: "success", message: "x" }} onStartOver={() => {}} />);
    const email = screen.getByText("priya@example.com");
    const phone = screen.getByText("+91••••••••10");
    expect(email).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(email).not.toBe(phone);
  });

  it("renders a long email safely without truncation or hiding it", () => {
    const longEmail = "vignesh.veeraraj.aroora.product.enquiries@a-very-long-example-domain.com";
    render(
      <SuccessState values={{ ...VALUES, email: longEmail }} submission={{ status: "success", message: "x" }} onStartOver={() => {}} />,
    );
    expect(screen.getByText(longEmail)).toBeInTheDocument();
  });

  it("masks the phone number using the canonical E.164 value, not the raw national number", () => {
    render(<SuccessState values={VALUES} submission={{ status: "success", message: "x" }} onStartOver={() => {}} />);
    expect(screen.queryByText("9876543210")).not.toBeInTheDocument();
    expect(screen.queryByText("+919876543210")).not.toBeInTheDocument();
    expect(screen.getByText("+91••••••••10")).toBeInTheDocument();
  });

  it("masks a Hong Kong number sensibly (3-digit calling code, 8-digit national number)", () => {
    render(
      <SuccessState
        values={{ ...VALUES, country: "HK", phone: "51234567" }}
        submission={{ status: "success", message: "x" }}
        onStartOver={() => {}}
      />,
    );
    expect(screen.queryByText("+85251234567")).not.toBeInTheDocument();
    const masked = screen.getByText(/^\+85.*67$/);
    expect(masked).toBeInTheDocument();
  });

  it("does not show a Reference block when no reference number was returned", () => {
    render(<SuccessState values={VALUES} submission={{ status: "success", message: "x" }} onStartOver={() => {}} />);
    expect(screen.queryByText(/Reference:/)).not.toBeInTheDocument();
  });

  it("shows a Reference block when a reference number is present, without inventing one itself", () => {
    render(
      <SuccessState
        values={VALUES}
        submission={{ status: "success", message: "x", referenceNumber: "ARP-000123" }}
        onStartOver={() => {}}
      />,
    );
    expect(screen.getByText("ARP-000123")).toBeInTheDocument();
  });

  it("shows the preferred contact method", () => {
    render(<SuccessState values={VALUES} submission={{ status: "success", message: "x" }} onStartOver={() => {}} />);
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("offers a Start a New Enquiry action that calls onStartOver", async () => {
    const user = userEvent.setup({ delay: null });
    const onStartOver = vi.fn();
    render(<SuccessState values={VALUES} submission={{ status: "success", message: "x" }} onStartOver={onStartOver} />);
    await user.click(screen.getByRole("button", { name: "Start a New Enquiry" }));
    expect(onStartOver).toHaveBeenCalled();
  });
});
