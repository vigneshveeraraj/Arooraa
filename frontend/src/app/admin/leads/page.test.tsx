import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import AdminLeadsListPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

const PROJECT_LEAD = {
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

const MESA_LEAD = {
  id: "22222222-2222-2222-2222-222222222222",
  leadType: "MESA_DEMO",
  referenceNumber: "MESA-ABCDEF12",
  customerName: "Priya Sharma",
  companyOrRestaurant: "Spice Route",
  email: null,
  phone: "+919876543210",
  cityOrCountry: "Chennai",
  status: "CONTACTED",
  createdAt: "2026-08-02T10:00:00Z",
  followUpAt: null,
  assignedTo: null,
  estimatedValue: null,
  estimatedValueCurrency: null,
};

describe("AdminLeadsListPage", () => {
  const fetchMock = vi.fn();
  let lastUrl = "";

  beforeEach(() => {
    window.history.pushState({}, "", "/admin/leads");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    lastUrl = "";
    fetchMock.mockImplementation(async (url: string) => {
      lastUrl = url;
      if (url.includes("/auth/session")) {
        return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
      }
      if (url.includes("/leads")) {
        const params = new URLSearchParams(url.split("?")[1]);
        let content = [PROJECT_LEAD, MESA_LEAD];
        if (params.get("leadType") === "PROJECT_ENQUIRY") content = [PROJECT_LEAD];
        if (params.get("leadType") === "MESA_DEMO") content = [MESA_LEAD];
        if (params.get("search")) content = content.filter((l) => l.customerName.includes(params.get("search")!));
        return mockResponse(200, { content, page: { size: 20, number: 0, totalElements: content.length, totalPages: 1 } });
      }
      return mockResponse(404, {});
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState({}, "", "/");
  });

  it("lists both lead types by default", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Arun Kumar")).toBeInTheDocument();
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
  });

  it("filters by lead type", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("Arun Kumar");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Project" }));

    await waitFor(() => expect(screen.queryByText("Priya Sharma")).not.toBeInTheDocument());
    expect(screen.getByText("Arun Kumar")).toBeInTheDocument();
  });

  it("filters by status", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("Arun Kumar");

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Status filter"), "NEW");

    await waitFor(() => expect(lastUrl).toContain("status=NEW"));
  });

  it("searches leads", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("Arun Kumar");

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Search leads"), "Arun");
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => expect(screen.queryByText("Priya Sharma")).not.toBeInTheDocument());
    expect(screen.getByText("Arun Kumar")).toBeInTheDocument();
  });
});
