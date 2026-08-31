import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TalentAlertForm } from "./TalentAlertForm";
import { localTalentAlertAdapter, notConnectedTalentAlertAdapter } from "@/lib/careers/alerts-adapter";

describe("TalentAlertForm", () => {
  it("never preselects the recruitment-consent checkbox", () => {
    render(<TalentAlertForm />);
    expect(screen.getByRole("checkbox", { name: /i agree to receive AROORAA career opportunities/i })).not.toBeChecked();
  });

  it("shows validation errors for a fully empty submission, including missing consent", async () => {
    const user = userEvent.setup();
    render(<TalentAlertForm />);

    await user.click(screen.getByRole("button", { name: /get job alerts/i }));

    expect(await screen.findByText("Enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Choose at least one area of interest.")).toBeInTheDocument();
    expect(screen.getByText(/please confirm you'd like to receive AROORAA career updates/i)).toBeInTheDocument();
  });

  it("rejects an invalid email address", async () => {
    const user = userEvent.setup();
    render(<TalentAlertForm />);

    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /get job alerts/i }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("supports selecting more than one area of interest", async () => {
    const user = userEvent.setup();
    render(<TalentAlertForm />);

    await user.click(screen.getByRole("checkbox", { name: "AI & Data" }));
    await user.click(screen.getByRole("checkbox", { name: "Marketing & Growth" }));

    expect(screen.getByRole("checkbox", { name: "AI & Data" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Marketing & Growth" })).toBeChecked();
  });

  async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^name/i), "Priya");
    await user.type(screen.getByLabelText(/email address/i), "priya@example.com");
    await user.click(screen.getByRole("checkbox", { name: "AI & Data" }));
    await user.click(screen.getByRole("checkbox", { name: /i agree to receive AROORAA career opportunities/i }));
  }

  it("shows the success state when the adapter reports success (dependency-injected, never the live page's default)", async () => {
    const user = userEvent.setup();
    render(<TalentAlertForm adapter={localTalentAlertAdapter} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /get job alerts/i }));

    expect(await screen.findByText("You're on the list.")).toBeInTheDocument();
  });

  it("shows an honest error, never a fabricated success, when the adapter reports the system isn't connected", async () => {
    const user = userEvent.setup();
    render(<TalentAlertForm adapter={notConnectedTalentAlertAdapter} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /get job alerts/i }));

    expect(await screen.findByText(/isn't connected yet/i)).toBeInTheDocument();
    expect(screen.queryByText("You're on the list.")).not.toBeInTheDocument();
  });
});
