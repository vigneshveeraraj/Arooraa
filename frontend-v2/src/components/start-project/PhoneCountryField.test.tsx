import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhoneCountryField } from "./PhoneCountryField";

/** A controlled input needs its value prop to actually update between
 * keystrokes for multi-character user.type() sequences to behave
 * realistically — this tiny stateful wrapper does that. */
function ControlledPhoneField({ initialCountry = "IN" }: { initialCountry?: string }) {
  const [country, setCountry] = useState(initialCountry);
  const [phone, setPhone] = useState("");
  return <PhoneCountryField country={country} phone={phone} onCountryChange={setCountry} onPhoneChange={setPhone} />;
}

describe("PhoneCountryField", () => {
  it("does not default to any country — India is not preselected", () => {
    render(<PhoneCountryField country="" phone="" onCountryChange={() => {}} onPhoneChange={() => {}} />);
    expect(screen.getByLabelText(/Country/)).toHaveValue("");
  });

  it("shows the India dialing prefix as a fixed, non-editable chip once selected", () => {
    render(<PhoneCountryField country="IN" phone="" onCountryChange={() => {}} onPhoneChange={() => {}} />);
    expect(screen.getByText("+91")).toBeInTheDocument();
  });

  it("shows the Hong Kong dialing prefix once selected", () => {
    render(<PhoneCountryField country="HK" phone="" onCountryChange={() => {}} onPhoneChange={() => {}} />);
    expect(screen.getByText("+852")).toBeInTheDocument();
  });

  it("the visitor only ever types the national number, not the country code", () => {
    render(<PhoneCountryField country="IN" phone="98765 43210" onCountryChange={() => {}} onPhoneChange={() => {}} />);
    const input = screen.getByLabelText(/Phone number/);
    expect(input).toHaveValue("98765 43210");
    expect(input).not.toHaveValue(expect.stringContaining("+91"));
  });

  it("strips alphabetic characters as the visitor types", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ControlledPhoneField />);
    await user.type(screen.getByLabelText(/Phone number/), "9a8b7c");
    expect(screen.getByLabelText(/Phone number/)).toHaveValue("987");
  });

  it("rejects a purely alphabetic entry down to an empty field", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ControlledPhoneField />);
    await user.type(screen.getByLabelText(/Phone number/), "abcxyz");
    expect(screen.getByLabelText(/Phone number/)).toHaveValue("");
  });

  it("accepts a full, valid Indian mobile number as the visitor types it", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ControlledPhoneField />);
    await user.type(screen.getByLabelText(/Phone number/), "9876543210");
    expect(screen.getByLabelText(/Phone number/)).toHaveValue("98765 43210");
  });

  it("prevents obviously excessive length rather than accepting unlimited digits", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ControlledPhoneField />);
    await user.type(screen.getByLabelText(/Phone number/), "888888888888888888888888");
    const digitsOnly = (screen.getByLabelText(/Phone number/) as HTMLInputElement).value.replace(/\D/g, "");
    expect(digitsOnly.length).toBeLessThanOrEqual(15);
  });

  it("normalizes a pasted +91 number to the national number without duplicating the prefix", async () => {
    const user = userEvent.setup({ delay: null });
    let current = "";
    const onPhoneChange = vi.fn((v: string) => (current = v));
    const { rerender } = render(<PhoneCountryField country="IN" phone="" onCountryChange={() => {}} onPhoneChange={onPhoneChange} />);
    const input = screen.getByLabelText(/Phone number/);
    await user.click(input);
    await user.paste("+919876543210");
    rerender(<PhoneCountryField country="IN" phone={current} onCountryChange={() => {}} onPhoneChange={onPhoneChange} />);
    expect(current.replace(/\s/g, "")).toBe("9876543210");
    expect(current).not.toContain("+91");
  });

  it("normalizes a pasted number with the calling code but no + sign", async () => {
    const user = userEvent.setup({ delay: null });
    let current = "";
    const onPhoneChange = vi.fn((v: string) => (current = v));
    render(<PhoneCountryField country="IN" phone="" onCountryChange={() => {}} onPhoneChange={onPhoneChange} />);
    const input = screen.getByLabelText(/Phone number/);
    await user.click(input);
    await user.paste("919876543210");
    expect(current.replace(/\s/g, "")).toBe("9876543210");
  });

  it("switches the selected country when a pasted number belongs to a different one", async () => {
    const user = userEvent.setup({ delay: null });
    const onCountryChange = vi.fn();
    const onPhoneChange = vi.fn();
    render(<PhoneCountryField country="IN" phone="" onCountryChange={onCountryChange} onPhoneChange={onPhoneChange} />);
    const input = screen.getByLabelText(/Phone number/);
    await user.click(input);
    await user.paste("+14155550132");
    expect(onCountryChange).toHaveBeenCalledWith("US");
  });

  it("re-evaluates the number display when the country changes", async () => {
    const user = userEvent.setup({ delay: null });
    const onCountryChange = vi.fn();
    render(<PhoneCountryField country="IN" phone="98765 43210" onCountryChange={onCountryChange} onPhoneChange={() => {}} />);
    await user.selectOptions(screen.getByLabelText(/Country/), "HK");
    expect(onCountryChange).toHaveBeenCalledWith("HK");
  });

  it("shows validation errors for both country and phone", () => {
    render(
      <PhoneCountryField
        country=""
        phone=""
        countryError="Select your country."
        phoneError="Enter a valid phone number."
        onCountryChange={() => {}}
        onPhoneChange={() => {}}
      />,
    );
    expect(screen.getByText("Select your country.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid phone number.")).toBeInTheDocument();
  });

  it("uses inputMode=tel on the national-number field", () => {
    render(<PhoneCountryField country="IN" phone="" onCountryChange={() => {}} onPhoneChange={() => {}} />);
    expect(screen.getByLabelText(/Phone number/)).toHaveAttribute("inputMode", "tel");
  });
});
