import { auraConversationsUrl } from "../client";

/**
 * The project brief's client. Same bargain as the chat and voice clients: this is the only file
 * that knows the HTTP shape, failures come back as values, and every visitor-facing sentence is
 * written here rather than taken from a response body.
 */

/** Everything Aura understood. Every field is optional because absence is a real answer. */
export interface AuraBriefFields {
  problemStatement?: string;
  targetUsers?: string;
  currentSituation?: string;
  desiredOutcome?: string;
  proposedCapabilities?: string[];
  platforms?: string[];
  integrations?: string[];
  aiAutomationNeeds?: string;
  existingSystems?: string;
  constraints?: string;
  timeline?: string;
  unknowns?: string[];
  conversationSummary?: string;
}

export type AuraBriefStatus = "DRAFT" | "SUMMARISED" | "SUBMITTED";

export interface AuraBrief {
  fields: AuraBriefFields;
  status: AuraBriefStatus;
  /** Whether enough has been said, in a conversation that is actually about a project. */
  readyToSummarise: boolean;
  /** Whether Aura can create an enquiry at all. False is not an error — the summary still works. */
  handoffAvailable: boolean;
  enquiryReference?: string;
}

export interface AuraHandoffContact {
  name: string;
  companyName?: string;
  businessEmail: string;
  phone: string;
  country: string;
  role?: string;
  preferredContactMethod: "EMAIL" | "PHONE" | "WHATSAPP" | "VIDEO_CALL";
}

export type AuraBriefErrorKind =
  | "NETWORK"
  | "TIMEOUT"
  | "NOT_READY"
  | "INVALID_CONTACT"
  | "UNAVAILABLE"
  | "SERVER";

export interface AuraBriefFailure {
  ok: false;
  kind: AuraBriefErrorKind;
  message: string;
  /** Which contact field to point at, when the backend named one. */
  field?: string;
}

export type AuraBriefResult<T> = { ok: true; value: T } | AuraBriefFailure;

export interface AuraBriefApiClient {
  peek(conversationId: string): Promise<AuraBriefResult<AuraBrief>>;
  summarise(conversationId: string): Promise<AuraBriefResult<AuraBrief>>;
  handOff(
    conversationId: string,
    contact: AuraHandoffContact,
  ): Promise<AuraBriefResult<{ enquiryReference: string }>>;
}

const MESSAGES: Record<AuraBriefErrorKind, string> = {
  NETWORK: "I couldn't reach my notes just then. Try again?",
  TIMEOUT: "That took longer than I'd like. Try again?",
  NOT_READY: "Tell me a little more first, and I'll put a summary together.",
  INVALID_CONTACT: "Something in those details didn't look right.",
  UNAVAILABLE: "I can't pass this to the team from here just now.",
  SERVER: "Something went wrong on my side. Try again in a moment?",
};

/** Extraction is a model call, so this is the one Aura request that can genuinely take a while. */
const SUMMARISE_TIMEOUT_MS = 45_000;
const REQUEST_TIMEOUT_MS = 20_000;

const KIND_BY_CODE: Record<string, AuraBriefErrorKind> = {
  NO_BRIEF: "NOT_READY",
  BRIEF_NOT_REVIEWED: "NOT_READY",
  BRIEF_TOO_THIN: "NOT_READY",
  CONSENT_REQUIRED: "NOT_READY",
  INVALID_CONTACT: "INVALID_CONTACT",
  HANDOFF_DISABLED: "UNAVAILABLE",
  HANDOFF_UNAVAILABLE: "UNAVAILABLE",
  HANDOFF_REJECTED: "UNAVAILABLE",
};

function briefUrl(conversationId: string, suffix = ""): string {
  return `${auraConversationsUrl()}/${encodeURIComponent(conversationId)}/brief${suffix}`;
}

export function auraBriefFailure(kind: AuraBriefErrorKind, field?: string): AuraBriefFailure {
  return { ok: false, kind, message: MESSAGES[kind], field };
}

async function request(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response | { failed: AuraBriefErrorKind }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    return { failed: (error as Error)?.name === "AbortError" ? "TIMEOUT" : "NETWORK" };
  } finally {
    clearTimeout(timer);
  }
}

async function failureFrom(response: Response): Promise<AuraBriefFailure> {
  const body = (await response.json().catch(() => null)) as
    | { code?: unknown; field?: unknown }
    | null;
  const code = typeof body?.code === "string" ? body.code : "";
  const field = typeof body?.field === "string" ? body.field : undefined;
  const kind = KIND_BY_CODE[code] ?? (response.status === 503 ? "UNAVAILABLE" : "SERVER");
  return auraBriefFailure(kind, field);
}

/**
 * Reads the brief off the wire, keeping only fields this client declares. An unexpected field in a
 * response is dropped here rather than reaching a component that might render it.
 */
function toBrief(json: Record<string, unknown> | null): AuraBrief | null {
  if (!json) return null;
  const raw = (json.fields ?? {}) as Record<string, unknown>;
  const text = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : undefined);
  const list = (key: string) =>
    Array.isArray(raw[key]) ? (raw[key] as unknown[]).filter((v): v is string => typeof v === "string") : undefined;

  return {
    fields: {
      problemStatement: text("problemStatement"),
      targetUsers: text("targetUsers"),
      currentSituation: text("currentSituation"),
      desiredOutcome: text("desiredOutcome"),
      proposedCapabilities: list("proposedCapabilities"),
      platforms: list("platforms"),
      integrations: list("integrations"),
      aiAutomationNeeds: text("aiAutomationNeeds"),
      existingSystems: text("existingSystems"),
      constraints: text("constraints"),
      timeline: text("timeline"),
      unknowns: list("unknowns"),
      conversationSummary: text("conversationSummary"),
    },
    status: (json.status === "SUMMARISED" || json.status === "SUBMITTED"
      ? json.status
      : "DRAFT") as AuraBriefStatus,
    readyToSummarise: json.readyToSummarise === true,
    handoffAvailable: json.handoffAvailable === true,
    enquiryReference:
      typeof json.enquiryReference === "string" ? json.enquiryReference : undefined,
  };
}

export function createAuraBriefApiClient(): AuraBriefApiClient {
  async function readBrief(
    response: Response | { failed: AuraBriefErrorKind },
  ): Promise<AuraBriefResult<AuraBrief>> {
    if ("failed" in response) return auraBriefFailure(response.failed);
    if (!response.ok) return failureFrom(response);

    const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    const brief = toBrief(json);
    return brief ? { ok: true, value: brief } : auraBriefFailure("SERVER");
  }

  return {
    async peek(conversationId) {
      return readBrief(await request(briefUrl(conversationId), { method: "GET" }, REQUEST_TIMEOUT_MS));
    },

    async summarise(conversationId) {
      return readBrief(
        await request(
          briefUrl(conversationId),
          { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
          SUMMARISE_TIMEOUT_MS,
        ),
      );
    },

    async handOff(conversationId, contact) {
      const response = await request(
        briefUrl(conversationId, "/handoff"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Consent is sent as an explicit true, and this is the only place in the frontend that
          // writes it. It is set because the visitor answered a question with two buttons — never
          // because they filled a form in, and never by default.
          body: JSON.stringify({ consent: true, contact }),
        },
        REQUEST_TIMEOUT_MS,
      );
      if ("failed" in response) return auraBriefFailure(response.failed);
      if (!response.ok) return failureFrom(response);

      const json = (await response.json().catch(() => null)) as { enquiryReference?: unknown } | null;
      const reference = typeof json?.enquiryReference === "string" ? json.enquiryReference : "";
      if (!reference) return auraBriefFailure("SERVER");
      return { ok: true, value: { enquiryReference: reference } };
    },
  };
}
