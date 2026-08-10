import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import AdminLoginPage from "./page";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

describe("AdminLoginPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    replaceMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function renderLoggedOut() {
    fetchMock.mockResolvedValueOnce(mockResponse(401, {}));
    render(
      <AdminAuthProvider>
        <AdminLoginPage />
      </AdminAuthProvider>,
    );
    await screen.findByLabelText("Email");
  }

  it("renders the login form", async () => {
    await renderLoggedOut();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("disables submit while pending and redirects to /admin on success", async () => {
    await renderLoggedOut();
    let resolveLogin: (value: unknown) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "owner@arooraa.test");
    await user.type(screen.getByLabelText("Password"), "correct-horse-battery-staple");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: "Logging in…" })).toBeDisabled();

    resolveLogin(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin"));
  });

  it("shows the backend's generic error message on invalid credentials", async () => {
    await renderLoggedOut();
    fetchMock.mockResolvedValueOnce(
      mockResponse(401, { code: "INVALID_CREDENTIALS", message: "Invalid email or password." }),
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "owner@arooraa.test");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows a rate-limit message on 429", async () => {
    await renderLoggedOut();
    fetchMock.mockResolvedValueOnce(mockResponse(429, { code: "RATE_LIMITED", message: "Too many requests." }));

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "owner@arooraa.test");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/too many attempts/i);
  });
});
