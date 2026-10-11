import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import AdminLeadsListPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(window.location.search),
  usePathname: () => "/admin/leads",
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
  maskedPhone: null,
  direction: null,
  preferredContactMethod: null,
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
  maskedPhone: null,
  direction: null,
  preferredContactMethod: null,
};

/** LEAD_CAPTURE rows arrive with null identity fields; the requirement comes in `direction`. */
const CAPTURE_LEAD = {
  id: "33333333-3333-3333-3333-333333333333",
  leadType: "LEAD_CAPTURE",
  referenceNumber: "LC-7Q2M9X",
  customerName: null,
  companyOrRestaurant: null,
  email: null,
  phone: "+919840012345",
  cityOrCountry: null,
  status: "NEW",
  createdAt: "2026-08-03T10:00:00Z",
  followUpAt: null,
  assignedTo: null,
  estimatedValue: null,
  estimatedValueCurrency: null,
  maskedPhone: "+91••••••••45",
  direction: "Website",
  preferredContactMethod: null,
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
        let content: Array<typeof PROJECT_LEAD | typeof MESA_LEAD | typeof CAPTURE_LEAD> = [
          PROJECT_LEAD,
          MESA_LEAD,
          CAPTURE_LEAD,
        ];
        if (params.get("leadType") === "PROJECT_ENQUIRY") content = [PROJECT_LEAD];
        if (params.get("leadType") === "MESA_DEMO") content = [MESA_LEAD];
        if (params.get("leadType") === "LEAD_CAPTURE") content = [CAPTURE_LEAD];
        if (params.get("search")) {
          const term = params.get("search")!;
          content = content.filter((l) => (l.customerName ?? "").includes(term) || l.referenceNumber.includes(term));
        }
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

  it("filters by follow-up", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("Arun Kumar");

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Follow-up filter"), "OVERDUE");

    await waitFor(() => expect(lastUrl).toContain("followUp=OVERDUE"));
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

  it("shows an empty state when nothing matches", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
      if (url.includes("/leads")) return mockResponse(200, { content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } });
      return mockResponse(404, {});
    });

    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("No leads match these filters.")).toBeInTheDocument();
  });

  it("shows an error state when the request fails", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
      return mockResponse(500, { message: "Something went wrong on our end. Please try again shortly." });
    });

    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
  });

  it("lists a lead capture without inventing a name and labels it as a lead capture, not MESA", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );

    const reference = await screen.findByText("LC-7Q2M9X");
    const row = reference.closest("tr")!;
    expect(row).toHaveTextContent("Lead Capture");
    expect(row).not.toHaveTextContent("MESA");
    expect(row).toHaveTextContent("No name · Website");
    expect(row).not.toHaveTextContent("null");
    expect(row).not.toHaveTextContent("+919840012345");
    expect(row.querySelector("a")).toHaveAttribute(
      "href",
      "/admin/leads/detail?type=LEAD_CAPTURE&id=33333333-3333-3333-3333-333333333333",
    );
  });

  it("shows a dash for a lead capture with neither a name nor a requirement", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
      if (url.includes("/leads")) {
        const content = [{ ...CAPTURE_LEAD, direction: null }];
        return mockResponse(200, { content, page: { size: 20, number: 0, totalElements: 1, totalPages: 1 } });
      }
      return mockResponse(404, {});
    });

    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );

    const row = (await screen.findByText("LC-7Q2M9X")).closest("tr")!;
    expect(row.querySelector('td[data-label="Customer"]')).toHaveTextContent("—");
    expect(row).not.toHaveTextContent("No name");
  });

  it("filters to lead captures only", async () => {
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("Arun Kumar");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Lead Capture" }));

    await waitFor(() => expect(lastUrl).toContain("leadType=LEAD_CAPTURE"));
    await waitFor(() => expect(screen.queryByText("Arun Kumar")).not.toBeInTheDocument());
    expect(screen.queryByText("Priya Sharma")).not.toBeInTheDocument();
    expect(screen.getByText("LC-7Q2M9X")).toBeInTheDocument();
  });

  it("applies a ?leadType=LEAD_CAPTURE deep link", async () => {
    window.history.pushState({}, "", "/admin/leads?leadType=LEAD_CAPTURE");
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("LC-7Q2M9X")).toBeInTheDocument();
    expect(lastUrl).toContain("leadType=LEAD_CAPTURE");
    expect(screen.queryByText("Arun Kumar")).not.toBeInTheDocument();
  });

  it("ignores an unknown ?leadType deep link and lists every type", async () => {
    window.history.pushState({}, "", "/admin/leads?leadType=SOMETHING_ELSE");
    render(
      <AdminAuthProvider>
        <AdminLeadsListPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Arun Kumar")).toBeInTheDocument();
    expect(screen.getByText("LC-7Q2M9X")).toBeInTheDocument();
    expect(lastUrl).not.toContain("leadType=");
  });
});
