import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import AdminDashboardPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

const SAMPLE_LEAD = {
  id: "11111111-1111-1111-1111-111111111111",
  leadType: "PROJECT_ENQUIRY",
  referenceNumber: "ARO-2026-000001",
  customerName: "Arun Kumar",
  companyOrRestaurant: "Acme Co",
  email: "arun@example.com",
  phone: "+919876500000",
  cityOrCountry: "India",
  status: "NEW",
  createdAt: "2026-08-01T10:00:00Z",
  followUpAt: null,
  assignedTo: null,
  estimatedValue: null,
  estimatedValueCurrency: null,
};

function routeFetch(url: string): Response {
  if (url.includes("/auth/session")) {
    return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
  }
  if (url.includes("/dashboard")) {
    return mockResponse(200, {
      totalNewLeads: 5,
      newProjectEnquiries: 3,
      newMesaDemoRequests: 2,
      followUpsDueToday: 1,
      overdueFollowUps: 0,
      qualified: 2,
      proposalSent: 1,
      negotiation: 0,
      won: 4,
      lost: 1,
    });
  }
  if (url.includes("/leads")) {
    return mockResponse(200, { content: [SAMPLE_LEAD], page: { size: 10, number: 0, totalElements: 1, totalPages: 1 } });
  }
  return mockResponse(404, {});
}

describe("AdminDashboardPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (url: string) => routeFetch(url));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and shows the KPI cards and recent leads", async () => {
    render(
      <AdminAuthProvider>
        <AdminDashboardPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(await screen.findByText("New Leads")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // totalNewLeads
    expect(screen.getByText("Arun Kumar")).toBeInTheDocument();
    expect(screen.getByText("ARO-2026-000001")).toBeInTheDocument();
  });
});
