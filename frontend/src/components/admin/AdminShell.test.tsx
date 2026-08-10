import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider } from "./AdminAuthContext";
import { AdminShell } from "./AdminShell";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

describe("AdminShell", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    replaceMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the logged-in admin's name and logs out on click", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" }));

    render(
      <AdminAuthProvider>
        <AdminShell>
          <div>Page content</div>
        </AdminShell>
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Owner")).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce(mockResponse(204, null));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/login"));
  });
});
