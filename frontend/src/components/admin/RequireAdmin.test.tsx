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

  it("redirects to /admin/login when unauthenticated", async () => {
    fetchMock.mockResolvedValue(mockResponse(401, {}));

    render(
      <AdminAuthProvider>
        <RequireAdmin>
          <div>Protected content</div>
        </RequireAdmin>
      </AdminAuthProvider>,
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/login"));
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", async () => {
    fetchMock.mockResolvedValue(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));

    render(
      <AdminAuthProvider>
        <RequireAdmin>
          <div>Protected content</div>
        </RequireAdmin>
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
