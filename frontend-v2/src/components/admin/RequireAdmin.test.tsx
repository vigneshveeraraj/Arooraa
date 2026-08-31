import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AdminAuthProvider } from "./AdminAuthContext";
import { RequireAdmin } from "./RequireAdmin";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

describe("RequireAdmin", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    replaceMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading state before the session check resolves", () => {
    fetchMock.mockReturnValue(new Promise(() => {})); // never resolves
    render(
      <AdminAuthProvider>
        <RequireAdmin>
          <p>Protected content</p>
        </RequireAdmin>
      </AdminAuthProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders protected content once authenticated, never redirecting", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));

    render(
      <AdminAuthProvider>
        <RequireAdmin>
          <p>Protected content</p>
        </RequireAdmin>
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("never renders protected content and redirects to /admin/login when unauthenticated", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { message: "Authentication required." }));

    render(
      <AdminAuthProvider>
        <RequireAdmin>
          <p>Protected content</p>
        </RequireAdmin>
      </AdminAuthProvider>,
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/login"));
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });
});
