import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipOption } from "./ChipOption";

describe("ChipOption", () => {
  it("renders a real radio option with visible text", () => {
    render(<ChipOption name="timeline" value="ASAP" checked={false} onChange={() => {}} label="As soon as practical" />);
    expect(screen.getByRole("radio", { name: /As soon as practical/ })).toBeInTheDocument();
  });

  it("calls onChange on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipOption name="timeline" value="ASAP" checked={false} onChange={onChange} label="As soon as practical" />);
    await user.click(screen.getByRole("radio", { name: /As soon as practical/ }));
    expect(onChange).toHaveBeenCalledWith("ASAP");
  });

  it("supports checkbox mode", () => {
    render(<ChipOption type="checkbox" name="productTypes" value="WEB_APPLICATION" checked onChange={() => {}} label="Web application" />);
    expect(screen.getByRole("checkbox", { name: /Web application/ })).toBeChecked();
  });
});
