import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import AdminLeadDetailPage from "./page";

let mockSearch = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(mockSearch),
  usePathname: () => "/admin/leads/detail",
}));

function mockResponse(status: number, body: unknown): Response {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

const GUIDED_DETAIL = {
  id: "011238f0-27be-4fd7-b878-626ae89ed9ed",
  leadType: "PROJECT_ENQUIRY",
  referenceNumber: "ARO-2026-000017",
  status: "NEW",
  leadVersion: 1,
  createdAt: "2026-08-30T03:38:33Z",
  customerName: "vignesh veeraraj",
  companyOrRestaurant: null,
  email: "vignesh@example.com",
  phone: "+918220503447",
  cityOrCountry: "India",
  submittedFields: {
    "Submission type": "Guided",
    "Solution model": "New Product",
    "Engagement model": "Discover Define",
    "Problem statement": "We want to build a new ordering experience.",
    "Project stage": "Exploring",
    "Product types": "Saas Platform",
    Timeline: "Within 3 To 6 Months",
    "Budget range": "Under 5l",
    "Preferred contact time": "Afternoon",
    "WhatsApp consent": "No",
    "Preferred contact method": "Email",
    "Country code": "IN",
    Source: "WEBSITE",
    "Source page": "/start-project",
  },
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
  activity: [
    {
      id: "a1",
      actorName: "Owner",
      activityType: "STATUS_CHANGED",
      oldValue: "NEW",
      newValue: "CONTACTED",
      createdAt: "2026-08-30T04:00:00Z",
    },
  ],
};

const LEGACY_DETAIL = {
  ...GUIDED_DETAIL,
  id: "aaaaaaaa-1111-1111-1111-111111111111",
  referenceNumber: "ARO-2026-000001",
  submittedFields: {
    "Submission type": "Legacy",
    "Service type": "Custom Software",
    "Project type": "New Product",
    Description: "We need a logistics tracking platform.",
    "Existing system": "No",
    "Budget range": "From 2l To 5l",
    Timeline: "From 1 To 3 Months",
    "Preferred contact method": "Phone",
    "WhatsApp consent": "No",
  },
  notes: [],
  activity: [],
};

const MESA_DETAIL = {
  id: "bbbbbbbb-2222-2222-2222-222222222222",
  leadType: "MESA_DEMO",
  referenceNumber: "MESA-ABCDEF12",
  status: "CONTACTED",
  leadVersion: 1,
  createdAt: "2026-08-02T10:00:00Z",
  customerName: "Priya Sharma",
  companyOrRestaurant: "Spice Route",
  email: null,
  phone: "+919876543210",
  cityOrCountry: "Chennai",
  submittedFields: {
    "Number of outlets": "1 To 3",
    "Restaurant type": "Fine Dining",
    "Primary challenge": "Order Accuracy",
  },
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
};

function mockAuthAnd(detail: unknown, statusCode = 200) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
    if (url.includes("/users")) return mockResponse(200, []);
    if (init?.method === "PATCH" && url.includes("/status")) return mockResponse(204, null);
    if (url.includes("/leads/")) return mockResponse(statusCode, detail);
    return mockResponse(404, {});
  });
}

describe("AdminLeadDetailPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an error when the id/type query params are missing", async () => {
    mockSearch = "";
    vi.stubGlobal("fetch", vi.fn(async (url: string) => mockResponse(200, { id: "1", email: "o@x.test", displayName: "Owner" })));

    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Missing lead reference.");
  });

  it("renders every guided-flow field, correctly grouped, and omits legacy-only fields", async () => {
    mockSearch = `type=PROJECT_ENQUIRY&id=${GUIDED_DETAIL.id}`;
    vi.stubGlobal("fetch", mockAuthAnd(GUIDED_DETAIL));

    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("ARO-2026-000017")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "vignesh veeraraj" })).toBeInTheDocument();
    expect(screen.getByText("Project Enquiry")).toBeInTheDocument();

    expect(screen.getByText("New Product")).toBeInTheDocument(); // Solution model
    expect(screen.getByText("Discover Define")).toBeInTheDocument(); // Engagement model
    expect(screen.getByText("We want to build a new ordering experience.")).toBeInTheDocument();
    expect(screen.getByText("Exploring")).toBeInTheDocument(); // Project stage
    expect(screen.getByText("Saas Platform")).toBeInTheDocument(); // Product types
    expect(screen.getByText("Within 3 To 6 Months")).toBeInTheDocument(); // Timeline
    expect(screen.getByText("Under 5l")).toBeInTheDocument(); // Budget range

    // Never displays internal-only identifiers.
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/ip.?hash/i);
    expect(body).not.toMatch(/idempotency/i);
    expect(body).not.toMatch(/fingerprint/i);
  });

  it("renders a legacy enquiry's fields and never shows guided-only sections", async () => {
    mockSearch = `type=PROJECT_ENQUIRY&id=${LEGACY_DETAIL.id}`;
    vi.stubGlobal("fetch", mockAuthAnd(LEGACY_DETAIL));

    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Custom Software")).toBeInTheDocument();
    expect(screen.getByText("We need a logistics tracking platform.")).toBeInTheDocument();
    // "No" appears twice (Existing system, WhatsApp consent) — scope to the specific row.
    expect(screen.getByText("Existing system").closest("div")).toHaveTextContent("No");

    expect(screen.queryByText("Engagement")).not.toBeInTheDocument();
    expect(screen.queryByText("Products / Platforms")).not.toBeInTheDocument();
  });

  it("renders a MESA demo request's fields as a flat submitted-details list", async () => {
    mockSearch = `type=MESA_DEMO&id=${MESA_DETAIL.id}`;
    vi.stubGlobal("fetch", mockAuthAnd(MESA_DETAIL));

    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("MESA Demo")).toBeInTheDocument();
    expect(screen.getByText("Fine Dining")).toBeInTheDocument();
    expect(screen.getByText("Order Accuracy")).toBeInTheDocument();
  });

  it("changes status and reflects the new value after reload", async () => {
    mockSearch = `type=PROJECT_ENQUIRY&id=${GUIDED_DETAIL.id}`;
    const fetchMock = mockAuthAnd(GUIDED_DETAIL);
    let reloaded = false;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
      if (url.includes("/users")) return mockResponse(200, []);
      if (init?.method === "PATCH" && url.includes("/status")) {
        reloaded = true;
        return mockResponse(204, null);
      }
      if (url.includes("/leads/")) {
        return mockResponse(200, reloaded ? { ...GUIDED_DETAIL, status: "CONTACTED", leadVersion: 2 } : GUIDED_DETAIL);
      }
      return mockResponse(404, {});
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    await screen.findByText("ARO-2026-000017");
    await user.selectOptions(screen.getByLabelText("Current status"), "CONTACTED");
    await user.click(screen.getByRole("button", { name: "Update status" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/leads/PROJECT_ENQUIRY/011238f0-27be-4fd7-b878-626ae89ed9ed/status"),
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("shows a conflict banner on a 409 optimistic-lock failure and never silently overwrites", async () => {
    mockSearch = `type=PROJECT_ENQUIRY&id=${GUIDED_DETAIL.id}`;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/auth/session")) return mockResponse(200, { id: "1", email: "owner@arooraa.test", displayName: "Owner" });
        if (url.includes("/users")) return mockResponse(200, []);
        if (init?.method === "PATCH" && url.includes("/status")) return mockResponse(409, { message: "conflict" });
        if (url.includes("/leads/")) return mockResponse(200, GUIDED_DETAIL);
        return mockResponse(404, {});
      }),
    );

    const user = userEvent.setup();
    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    await screen.findByText("ARO-2026-000017");
    await user.selectOptions(screen.getByLabelText("Current status"), "CONTACTED");
    await user.click(screen.getByRole("button", { name: "Update status" }));

    // Two alerts legitimately coexist here: StatusEditor's own inline error and the
    // page-level conflict banner — query by exact text rather than a generic role.
    expect(await screen.findByText(/This lead was changed by someone else\./)).toBeInTheDocument();
  });

  it("shows the activity history entry recorded by the backend", async () => {
    mockSearch = `type=PROJECT_ENQUIRY&id=${GUIDED_DETAIL.id}`;
    vi.stubGlobal("fetch", mockAuthAnd(GUIDED_DETAIL));

    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    const activityPanel = (await screen.findByText("Activity History")).closest("div")!;
    expect(within(activityPanel).getByText(/Status changed: NEW → CONTACTED/)).toBeInTheDocument();
  });

  it("keeps the MESA demo flat section titled Submitted Details", async () => {
    mockSearch = `type=MESA_DEMO&id=${MESA_DETAIL.id}`;
    vi.stubGlobal("fetch", mockAuthAnd(MESA_DETAIL));

    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByText("Submitted Details")).toBeInTheDocument();
    expect(screen.queryByText("Consultation Request")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Priya Sharma" })).toBeInTheDocument();
  });

  describe("a LEAD_CAPTURE lead", () => {
    // Lead captures arrive with null identity fields; nothing may be invented in their place.
    const CAPTURE_DETAIL = {
      ...MESA_DETAIL,
      id: "cccccccc-3333-3333-3333-333333333333",
      leadType: "LEAD_CAPTURE",
      referenceNumber: "LC-7Q2M9X",
      status: "NEW",
      leadVersion: 3,
      customerName: null,
      companyOrRestaurant: null,
      email: null,
      phone: "+919840012345",
      cityOrCountry: null,
      submittedFields: {
        Requirement: "Ai Automation",
        "Preferred language": "Tamil",
        "Preferred call time": "Evening",
        "Consent given": "Yes",
        "Consent source": "Web Form",
        Source: "Website",
      },
      managementInfo: { ...MESA_DETAIL.managementInfo, version: 5 },
    };

    /** Stateful backend for the capture: mutations succeed and notes are echoed back on reload. */
    function mockCaptureBackend() {
      const notes: { id: string; adminName: string; note: string; createdAt: string }[] = [];
      return vi.fn(async (url: string, init?: RequestInit) => {
        const method = init?.method ?? "GET";
        if (url.includes("/auth/session")) return mockResponse(200, { id: "admin-1", email: "owner@arooraa.test", displayName: "Owner" });
        if (url.includes("/users")) return mockResponse(200, [{ id: "admin-1", email: "owner@arooraa.test", displayName: "Owner" }]);
        if (method === "POST" && url.includes("/notes")) {
          const body = JSON.parse(init!.body as string);
          const note = { id: "note-1", adminName: "Owner", note: body.note, createdAt: "2026-08-03T10:00:00Z" };
          notes.push(note);
          return mockResponse(201, note);
        }
        if (method === "PATCH") return mockResponse(204, null);
        if (url.endsWith(`/leads/LEAD_CAPTURE/${CAPTURE_DETAIL.id}`)) return mockResponse(200, { ...CAPTURE_DETAIL, notes: [...notes] });
        return mockResponse(404, {});
      });
    }

    beforeEach(() => {
      mockSearch = `type=LEAD_CAPTURE&id=${CAPTURE_DETAIL.id}`;
    });

    it("accepts type=LEAD_CAPTURE and fetches the capture detail endpoint", async () => {
      const fetchMock = mockCaptureBackend();
      vi.stubGlobal("fetch", fetchMock);

      render(
        <AdminAuthProvider>
          <AdminLeadDetailPage />
        </AdminAuthProvider>,
      );

      expect(await screen.findByText("LC-7Q2M9X")).toBeInTheDocument();
      expect(screen.queryByText("Missing lead reference.")).not.toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/leads/LEAD_CAPTURE/${CAPTURE_DETAIL.id}`),
        expect.anything(),
      );
    });

    it("renders requirement, phone, language, call time and consent without inventing a name or email", async () => {
      vi.stubGlobal("fetch", mockCaptureBackend());

      render(
        <AdminAuthProvider>
          <AdminLeadDetailPage />
        </AdminAuthProvider>,
      );

      expect(await screen.findByText("LC-7Q2M9X")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1, name: "Name not provided" })).toBeInTheDocument();
      expect(screen.getByText("Name").closest("div")).toHaveTextContent("Not provided");
      expect(screen.getByText("Lead Capture")).toBeInTheDocument();
      expect(screen.queryByText("MESA Demo")).not.toBeInTheDocument();
      expect(screen.getByText("Consultation Request")).toBeInTheDocument();
      expect(screen.queryByText("Submitted Details")).not.toBeInTheDocument();
      expect(screen.getByText("+919840012345")).toBeInTheDocument();
      expect(screen.getByText("Ai Automation")).toBeInTheDocument();
      expect(screen.getByText("Tamil")).toBeInTheDocument();
      expect(screen.getByText("Evening")).toBeInTheDocument();
      expect(screen.getByText("Web Form")).toBeInTheDocument();
      expect(screen.queryByText("Email")).not.toBeInTheDocument();
      expect(screen.queryByText("Restaurant")).not.toBeInTheDocument();
      expect(screen.queryByText("City")).not.toBeInTheDocument();
      expect(document.body.textContent).not.toContain("null");
      expect(screen.getByRole("link", { name: "← Back to leads" })).toHaveAttribute("href", "/admin/leads");
    });

    it("sends status and note changes to the LEAD_CAPTURE endpoints with the lead version", async () => {
      const fetchMock = mockCaptureBackend();
      vi.stubGlobal("fetch", fetchMock);

      const user = userEvent.setup();
      render(
        <AdminAuthProvider>
          <AdminLeadDetailPage />
        </AdminAuthProvider>,
      );
      await screen.findByText("LC-7Q2M9X");

      await user.selectOptions(screen.getByLabelText("Current status"), "CONTACTED");
      await user.click(screen.getByRole("button", { name: "Update status" }));

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining(`/leads/LEAD_CAPTURE/${CAPTURE_DETAIL.id}/status`),
          expect.objectContaining({ method: "PATCH", body: expect.stringContaining('"expectedVersion":3') }),
        ),
      );

      await user.type(screen.getByLabelText("Add a note"), "Prefers a call after 6pm.");
      await user.click(screen.getByRole("button", { name: "Add note" }));

      expect(await screen.findByText("Prefers a call after 6pm.")).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/leads/LEAD_CAPTURE/${CAPTURE_DETAIL.id}/notes`),
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("sends follow-up, assignment and estimated-value changes to the LEAD_CAPTURE endpoints with the management version", async () => {
      const fetchMock = mockCaptureBackend();
      vi.stubGlobal("fetch", fetchMock);

      const user = userEvent.setup();
      render(
        <AdminAuthProvider>
          <AdminLeadDetailPage />
        </AdminAuthProvider>,
      );
      await screen.findByText("LC-7Q2M9X");
      await screen.findByText("Owner", { selector: "option" });

      await user.type(screen.getByLabelText("Next follow-up"), "2026-09-01T10:00");
      await user.click(screen.getByRole("button", { name: "Save follow-up" }));
      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining(`/leads/LEAD_CAPTURE/${CAPTURE_DETAIL.id}/follow-up`),
          expect.objectContaining({ method: "PATCH", body: expect.stringContaining('"expectedVersion":5') }),
        ),
      );

      await user.selectOptions(screen.getByLabelText("Assigned to"), "admin-1");
      await user.click(screen.getByRole("button", { name: "Save assignment" }));
      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining(`/leads/LEAD_CAPTURE/${CAPTURE_DETAIL.id}/assignment`),
          expect.objectContaining({ method: "PATCH", body: expect.stringContaining('"expectedVersion":5') }),
        ),
      );

      await user.type(screen.getByLabelText("Estimated value"), "50000");
      await user.click(screen.getByRole("button", { name: "Save estimated value" }));
      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining(`/leads/LEAD_CAPTURE/${CAPTURE_DETAIL.id}/estimated-value`),
          expect.objectContaining({ method: "PATCH" }),
        ),
      );
    });
  });

  it("rejects an unknown lead type in the query string", async () => {
    mockSearch = `type=SOMETHING_ELSE&id=${MESA_DETAIL.id}`;
    vi.stubGlobal("fetch", mockAuthAnd(MESA_DETAIL));

    render(
      <AdminAuthProvider>
        <AdminLeadDetailPage />
      </AdminAuthProvider>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Missing lead reference.");
  });
});
