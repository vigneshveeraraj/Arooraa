import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import type { AdminLeadDetail } from "@/lib/admin/types";
import AdminLeadDetailPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

const LEAD_ID = "11111111-1111-1111-1111-111111111111";

function buildDetail(overrides: Partial<AdminLeadDetail> = {}): AdminLeadDetail {
  return {
    id: LEAD_ID,
    leadType: "PROJECT_ENQUIRY",
    referenceNumber: "ARO-2026-000001",
    status: "NEW",
    leadVersion: 0,
    createdAt: "2026-08-01T10:00:00Z",
    customerName: "Arun Kumar",
    companyOrRestaurant: "Acme Co",
    email: "arun@example.com",
    phone: "+919876500000",
    cityOrCountry: "India",
    submittedFields: { "Service type": "Custom Software", Description: "We need a platform." },
    managementInfo: {
      assignedAdminId: null,
      assignedAdminName: null,
      followUpAt: null,
      estimatedValue: null,
      estimatedValueCurrency: null,
      lostReason: null,
      internalSummary: null,
      lastContactedAt: null,
      version: 0,
    },
    notes: [],
    activity: [],
    ...overrides,
  };
}

describe("AdminLeadDetailPage", () => {
  const fetchMock = vi.fn();
  let detail = buildDetail();

  beforeEach(() => {
    detail = buildDetail();
    window.history.pushState({}, "", `/admin/leads/detail?type=PROJECT_ENQUIRY&id=${LEAD_ID}`);
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";

      if (url.includes("/auth/session")) {
        return mockResponse(200, { id: "admin-1", email: "owner@arooraa.test", displayName: "Owner" });
      }
      if (url.includes("/users")) {
        return mockResponse(200, [{ id: "admin-1", email: "owner@arooraa.test", displayName: "Owner" }]);
      }
      if (url.endsWith(`/leads/PROJECT_ENQUIRY/${LEAD_ID}`) && method === "GET") {
        return mockResponse(200, detail);
      }
      if (url.includes("/status") && method === "PATCH") {
        const body = JSON.parse(init!.body as string);
        if (body.status === "LOST" && !body.lostReason) {
          return mockResponse(400, { code: "VALIDATION_ERROR", message: "A lost reason is required." });
        }
        detail = { ...detail, status: body.status, leadVersion: detail.leadVersion + 1 };
        return mockResponse(204, null);
      }
      if (url.includes("/follow-up") && method === "PATCH") {
        const body = JSON.parse(init!.body as string);
        detail = {
          ...detail,
          managementInfo: { ...detail.managementInfo, followUpAt: body.followUpAt, version: detail.managementInfo.version + 1 },
        };
        return mockResponse(204, null);
      }
      if (url.includes("/assignment") && method === "PATCH") {
        const body = JSON.parse(init!.body as string);
        detail = {
          ...detail,
          managementInfo: {
            ...detail.managementInfo,
            assignedAdminId: body.assignedAdminId,
            assignedAdminName: body.assignedAdminId ? "Owner" : null,
            version: detail.managementInfo.version + 1,
          },
        };
        return mockResponse(204, null);
      }
      if (url.includes("/estimated-value") && method === "PATCH") {
        const body = JSON.parse(init!.body as string);
        detail = {
          ...detail,
          managementInfo: {
            ...detail.managementInfo,
            estimatedValue: body.estimatedValue,
            estimatedValueCurrency: body.currency,
            version: detail.managementInfo.version + 1,
          },
        };
        return mockResponse(204, null);
      }
      if (url.includes("/notes") && method === "POST") {
        const body = JSON.parse(init!.body as string);
        const note = { id: "note-1", adminName: "Owner", note: body.note, createdAt: "2026-08-03T10:00:00Z" };
        detail = { ...detail, notes: [...detail.notes, note] };
        return mockResponse(201, note);
      }
      return mockResponse(404, {});
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Restore location so other test files sharing this worker's jsdom environment
    // don't see this page's query string (e.g. code reading window.location.search).
    window.history.pushState({}, "", "/");
  });

  it("renders customer info, submitted fields, and status", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("ARO-2026-000001")).toBeInTheDocument();
    expect(screen.getAllByText("Arun Kumar").length).toBeGreaterThan(0);
    expect(screen.getByText("Custom Software")).toBeInTheDocument();
  });

  it("updates status", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000001");

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Current status"), "CONTACTED");
    await user.click(screen.getByRole("button", { name: "Update status" }));

    await waitFor(() => expect(screen.getAllByText("Contacted").length).toBeGreaterThan(0));
  });

  it("requires a lost reason when marking a lead LOST", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000001");

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Current status"), "LOST");
    await user.click(screen.getByRole("button", { name: "Update status" }));

    expect(await screen.findByText("Choose a lost reason.")).toBeInTheDocument();
  });

  it("sets a follow-up date", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000001");

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Next follow-up"), "2026-09-01T10:00");
    await user.click(screen.getByRole("button", { name: "Save follow-up" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/follow-up"), expect.anything()));
  });

  it("assigns the lead to an admin", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000001");
    await screen.findByText("Owner", { selector: "option" });

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Assigned to"), "admin-1");
    await user.click(screen.getByRole("button", { name: "Save assignment" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/assignment"), expect.anything()));
  });

  it("sets an estimated value", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000001");

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Estimated value"), "250000");
    await user.click(screen.getByRole("button", { name: "Save estimated value" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/estimated-value"), expect.anything()),
    );
  });

  it("adds a note", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000001");

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Add a note"), "Called and left a voicemail.");
    await user.click(screen.getByRole("button", { name: "Add note" }));

    expect(await screen.findByText("Called and left a voicemail.")).toBeInTheDocument();
  });
});
