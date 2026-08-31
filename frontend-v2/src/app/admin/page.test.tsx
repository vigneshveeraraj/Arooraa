import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import AdminDashboardPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin",
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

const SUMMARY = {
  totalNewLeads: 4,
  newProjectEnquiries: 3,
  newMesaDemoRequests: 9,
  followUpsDueToday: 2,
  overdueFollowUps: 8,
  qualified: 5,
  proposalSent: 7,
  negotiation: 1,
  won: 6,
  lost: 0,
};

describe("AdminDashboardPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows every real dashboard count from the backend, never a fabricated number", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "o@x.test", displayName: "Owner" });
      if (url.includes("/dashboard")) return mockResponse(200, SUMMARY);
      if (url.includes("/leads")) return mockResponse(200, { content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } });
      return mockResponse(404, {});
    });

    render(
      <AdminAuthProvider>
        <AdminDashboardPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("4")).toBeInTheDocument(); // New Leads
    expect(screen.getByText("2")).toBeInTheDocument(); // Follow-up Today
    expect(screen.getByText("8")).toBeInTheDocument(); // Overdue
    expect(screen.getByText("6")).toBeInTheDocument(); // Won
    expect(screen.getByText("3")).toBeInTheDocument(); // New Project Enquiries
    expect(screen.getByText("9")).toBeInTheDocument(); // New MESA Demo Requests
  });

  it("shows recent leads from the same backend list endpoint", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "o@x.test", displayName: "Owner" });
      if (url.includes("/dashboard")) return mockResponse(200, SUMMARY);
      if (url.includes("/leads")) {
        return mockResponse(200, {
          content: [
            {
              id: "1",
              leadType: "PROJECT_ENQUIRY",
              referenceNumber: "ARO-2026-000017",
              customerName: "Vignesh Veeraraj",
              companyOrRestaurant: null,
              email: "vignesh@example.com",
              phone: "+918760223447",
              cityOrCountry: "India",
              status: "NEW",
              createdAt: "2026-08-30T03:38:33Z",
              followUpAt: null,
              assignedTo: null,
              estimatedValue: null,
              estimatedValueCurrency: null,
              maskedPhone: "+91••••••••47",
              direction: "New Product",
              preferredContactMethod: "Email",
            },
          ],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        });
      }
      return mockResponse(404, {});
    });

    render(
      <AdminAuthProvider>
        <AdminDashboardPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Vignesh Veeraraj")).toBeInTheDocument();
  });

  it("shows an error state when the dashboard summary request fails", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "o@x.test", displayName: "Owner" });
      if (url.includes("/dashboard")) return mockResponse(500, { message: "Something went wrong on our end. Please try again shortly." });
      if (url.includes("/leads")) return mockResponse(200, { content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } });
      return mockResponse(404, {});
    });

    render(
      <AdminAuthProvider>
        <AdminDashboardPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
  });
});
