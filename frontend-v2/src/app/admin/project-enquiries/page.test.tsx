import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import AdminProjectEnquiriesPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/project-enquiries",
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

const ENQUIRY_ONE = {
  id: "11111111-1111-1111-1111-111111111111",
  leadType: "PROJECT_ENQUIRY",
  referenceNumber: "ARO-2026-000017",
  customerName: "Vignesh Veeraraj",
  companyOrRestaurant: null,
  email: "vignesh.veeraraj@example.com",
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
};

const ENQUIRY_TWO = {
  id: "22222222-2222-2222-2222-222222222222",
  leadType: "PROJECT_ENQUIRY",
  referenceNumber: "ARO-2026-000001",
  customerName: "Arun Kumar",
  companyOrRestaurant: "ABC Logistics",
  email: "arun@example.com",
  phone: "+919876543210",
  cityOrCountry: "India",
  status: "CONTACTED",
  createdAt: "2026-08-01T10:00:00Z",
  followUpAt: null,
  assignedTo: null,
  estimatedValue: null,
  estimatedValueCurrency: null,
  maskedPhone: "+91••••••••10",
  direction: "Custom Software",
  preferredContactMethod: "Phone",
};

describe("AdminProjectEnquiriesPage", () => {
  const fetchMock = vi.fn();
  let lastUrl = "";

  beforeEach(() => {
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
        if (params.get("leadType") !== "PROJECT_ENQUIRY") {
          return mockResponse(400, { message: "expected leadType=PROJECT_ENQUIRY" });
        }
        let content = [ENQUIRY_ONE, ENQUIRY_TWO];
        if (params.get("status")) content = content.filter((e) => e.status === params.get("status"));
        if (params.get("search")) {
          const term = params.get("search")!;
          content = content.filter((e) => e.customerName.includes(term) || e.referenceNumber.includes(term));
        }
        return mockResponse(200, { content, page: { size: 20, number: 0, totalElements: content.length, totalPages: 1 } });
      }
      return mockResponse(404, {});
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists project enquiries with the customer's secondary email/phone line, direction and preferred contact", async () => {
    render(
      <AdminAuthProvider>
        <AdminProjectEnquiriesPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("ARO-2026-000017")).toBeInTheDocument();
    expect(screen.getByText("Vignesh Veeraraj")).toBeInTheDocument();
    expect(screen.getByText("vignesh.…@example.com · +91••••••••47")).toBeInTheDocument();
    expect(screen.queryByText("+918760223447")).not.toBeInTheDocument();
    expect(screen.getByText("New Product")).toBeInTheDocument();
  });

  it("always scopes the request to PROJECT_ENQUIRY, with no lead-type toggle in the UI", async () => {
    render(
      <AdminAuthProvider>
        <AdminProjectEnquiriesPage />
      </AdminAuthProvider>,
    );

    await screen.findByText("ARO-2026-000017");
    expect(lastUrl).toContain("leadType=PROJECT_ENQUIRY");
    expect(screen.queryByRole("button", { name: "MESA" })).not.toBeInTheDocument();
  });

  it("filters by status", async () => {
    render(
      <AdminAuthProvider>
        <AdminProjectEnquiriesPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000017");

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Status filter"), "CONTACTED");

    await waitFor(() => expect(screen.queryByText("ARO-2026-000017")).not.toBeInTheDocument());
    // Arun Kumar's row also shows his company inline ("Arun Kumar — ABC Logistics").
    expect(screen.getByText(/Arun Kumar/)).toBeInTheDocument();
  });

  it("searches by reference number", async () => {
    render(
      <AdminAuthProvider>
        <AdminProjectEnquiriesPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000017");

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Search project enquiries"), "ARO-2026-000017");
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => expect(screen.queryByText("Arun Kumar")).not.toBeInTheDocument());
    expect(screen.getByText("Vignesh Veeraraj")).toBeInTheDocument();
  });

  it("links each row to the shared project-enquiry detail page", async () => {
    render(
      <AdminAuthProvider>
        <AdminProjectEnquiriesPage />
      </AdminAuthProvider>,
    );
    await screen.findByText("ARO-2026-000017");

    const links = screen.getAllByRole("link", { name: "Open →" });
    expect(links[0]).toHaveAttribute(
      "href",
      "/admin/leads/detail?type=PROJECT_ENQUIRY&id=11111111-1111-1111-1111-111111111111",
    );
  });

  it("shows an error state when the request fails", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
      return mockResponse(500, { message: "Something went wrong on our end. Please try again shortly." });
    });

    render(
      <AdminAuthProvider>
        <AdminProjectEnquiriesPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
  });

  it("shows an empty state when no enquiries match", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
      if (url.includes("/leads")) return mockResponse(200, { content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } });
      return mockResponse(404, {});
    });

    render(
      <AdminAuthProvider>
        <AdminProjectEnquiriesPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("No project enquiries match these filters.")).toBeInTheDocument();
  });
});
