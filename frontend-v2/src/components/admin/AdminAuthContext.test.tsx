import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuthContext";

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

function Probe() {
  const { status, admin, login, logout } = useAdminAuth();
  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="admin">{admin?.displayName ?? "none"}</p>
      <button onClick={() => login("owner@arooraa.test", "wrong-password")}>login</button>
      <button onClick={() => logout()}>logout</button>
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

  it("checks the session on mount and becomes authenticated when one exists", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));

    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("Owner");
  });

  it("becomes unauthenticated when no session exists", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Authentication required." }));

    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
  });

  it("reports a login failure without changing status to authenticated", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Authentication required." }));
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Invalid email or password." }));

    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    screen.getByText("login").click();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
  });

  it("logs out and clears the admin session", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));
    fetchMock.mockResolvedValueOnce(mockResponse(204, null));

    render(
      <AdminAuthProvider>
        <Probe />
      </AdminAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));

    screen.getByText("logout").click();
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("none");
  });
});
