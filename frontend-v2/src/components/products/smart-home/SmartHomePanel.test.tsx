import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomePanel } from "./SmartHomePanel";

describe("SmartHomePanel", () => {
  it("renders its children inside the shared panel surface", () => {
    render(
      <SmartHomePanel>
        <p>Panel content</p>
      </SmartHomePanel>,
    );
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });
});
