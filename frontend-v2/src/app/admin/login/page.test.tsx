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

/**
 * Pasted rather than typed. `user.type` fires a keystroke at a time, and a controlled form
 * re-renders on every one — forty-six of them per test here, for credentials no test inspects
 * character by character. Under a full-suite run that was the difference between a fast test and a
 * timeout. What these tests are about is what happens after the submit.
 */
async function fill(user: ReturnType<typeof userEvent.setup>, element: HTMLElement, text: string) {
  await user.click(element);
  await user.paste(text);
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

  it("renders email and password fields with a submit button", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Authentication required." }));

    render(
      <AdminAuthProvider>
        <AdminLoginPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("shows a loading state on submit and disables the form", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Authentication required." }));
    let resolveLogin: (r: Response) => void = () => {};
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );

    const user = userEvent.setup();
    render(
      <AdminAuthProvider>
        <AdminLoginPage />
      </AdminAuthProvider>,
    );
    await screen.findByLabelText("Email");

    await fill(user, screen.getByLabelText("Email"), "owner@arooraa.test");
    await fill(user, screen.getByLabelText("Password"), "correct-horse-battery-staple");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: "Logging in…" })).toBeDisabled();
    resolveLogin(mockResponse(401, { message: "Invalid email or password." }));
  });

  it("shows an invalid-credentials error and never redirects on failure", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Authentication required." }));
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Invalid email or password." }));

    const user = userEvent.setup();
    render(
      <AdminAuthProvider>
        <AdminLoginPage />
      </AdminAuthProvider>,
    );
    await screen.findByLabelText("Email");

    await fill(user, screen.getByLabelText("Email"), "owner@arooraa.test");
    await fill(user, screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects to /admin on successful login", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Authentication required." }));
    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));

    const user = userEvent.setup();
    render(
      <AdminAuthProvider>
        <AdminLoginPage />
      </AdminAuthProvider>,
    );
    await screen.findByLabelText("Email");

    await fill(user, screen.getByLabelText("Email"), "owner@arooraa.test");
    await fill(user, screen.getByLabelText("Password"), "correct-horse-battery-staple");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin"));
  });

  it("redirects away immediately when already authenticated", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));

    render(
      <AdminAuthProvider>
        <AdminLoginPage />
      </AdminAuthProvider>,
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin"));
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });
});
