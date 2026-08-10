import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuthContext";

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

function Probe() {
  const { status, admin, login, logout } = useAdminAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="admin">{admin?.email ?? "none"}</span>
      <button onClick={() => void login("owner@arooraa.test", "correct-horse-battery-staple")}>Login</button>
      <button onClick={() => void logout()}>Logout</button>
    </div>
  );
}

describe("AdminAuthProvider", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("restores an authenticated session on mount", async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));

    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("owner@arooraa.test");
  });

  it("shows unauthenticated when there is no session", async () => {
    fetchMock.mockResolvedValue(mockResponse(401, { code: "UNAUTHENTICATED", message: "Authentication required." }));

    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
  });

  it("login moves status to authenticated on success", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, {}));
    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));
    const user = userEvent.setup();
    await user.click(screen.getByText("Login"));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
  });

  it("logout clears the session", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));
    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));

    fetchMock.mockResolvedValueOnce(mockResponse(204, null));
    const user = userEvent.setup();
    await user.click(screen.getByText("Logout"));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("none");
  });
});
