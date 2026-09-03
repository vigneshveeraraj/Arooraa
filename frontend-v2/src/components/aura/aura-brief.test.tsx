import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuraApiClient } from "@/lib/aura/client";
import type { AuraAnswer, AuraResult } from "@/lib/aura/types";
import type {
  AuraBrief,
  AuraBriefApiClient,
  AuraBriefResult,
  AuraHandoffContact,
} from "@/lib/aura/brief/brief-client";
import { AuraWidget } from "./AuraWidget";

const pathname = vi.fn(() => "/");
const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
  useRouter: () => ({ push }),
}));

/**
 * A6 through the real widget: a visitor talks through an idea, is offered a summary, reads it, and
 * either sends it or does not.
 *
 * <p>The tests that matter most are the ones about the order of things. Consent is a question with
 * two buttons, asked before any details are collected — so this file proves, from the browser's
 * side, that filling in a form is never what said yes.
 */

class FakeAuraClient implements AuraApiClient {
  sent: string[] = [];

  async createConversation() {
    return {
      ok: true as const,
      value: { conversationId: "c-1", assistantProfile: "AROORAA_WEBSITE", channel: "PUBLIC_WEB" },
    };
  }

  async sendMessage(conversationId: string, message: string): Promise<AuraResult<AuraAnswer>> {
    this.sent.push(message);
    return {
      ok: true as const,
      value: { conversationId, sequence: 1, answer: "What are they doing today?", sources: [], diagnostics: null },
    };
  }
}

const FULL_BRIEF: AuraBrief = {
  fields: {
    problemStatement: "Parents miss school schedule changes",
    targetUsers: "Parents, and the school office",
    currentSituation: "WhatsApp groups and a paper diary",
    platforms: ["phones", "laptop"],
    unknowns: ["How many schools", "Whether payments are involved"],
    conversationSummary: "An app for parents to manage school schedules.",
  },
  status: "SUMMARISED",
  readyToSummarise: true,
  handoffAvailable: true,
};

class FakeBriefClient implements AuraBriefApiClient {
  peeks = 0;
  summarises = 0;
  handoffs: { conversationId: string; contact: AuraHandoffContact }[] = [];

  private peeked: AuraBrief = { ...FULL_BRIEF, status: "DRAFT" };
  private summary: AuraBriefResult<AuraBrief> = { ok: true, value: FULL_BRIEF };
  private handoff: AuraBriefResult<{ enquiryReference: string }> = {
    ok: true,
    value: { enquiryReference: "ARO-2026-000001" },
  };

  withPeek(brief: Partial<AuraBrief>) {
    this.peeked = { ...this.peeked, ...brief };
    return this;
  }

  withSummary(result: AuraBriefResult<AuraBrief>) {
    this.summary = result;
    return this;
  }

  withHandoff(result: AuraBriefResult<{ enquiryReference: string }>) {
    this.handoff = result;
    return this;
  }

  async peek(): Promise<AuraBriefResult<AuraBrief>> {
    this.peeks += 1;
    return { ok: true, value: this.peeked };
  }

  async summarise(): Promise<AuraBriefResult<AuraBrief>> {
    this.summarises += 1;
    return this.summary;
  }

  async handOff(conversationId: string, contact: AuraHandoffContact) {
    this.handoffs.push({ conversationId, contact });
    return this.handoff;
  }
}

beforeEach(() => {
  pathname.mockReturnValue("/");
  window.sessionStorage.clear();
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function openAura(client: AuraApiClient, briefClient: AuraBriefApiClient) {
  const user = userEvent.setup();
  render(<AuraWidget client={client} briefClient={briefClient} />);
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  await screen.findByRole("dialog", { name: /Aura/ });
  return user;
}

/**
 * Fills a field in one go rather than a keystroke at a time.
 *
 * <p>The composer re-measures itself on every change to grow with the message, so typing a
 * fifty-character sentence character by character is fifty renders — and four fields plus three
 * messages is enough of them to time a test out. Pasting is also closer to what the tests are
 * about: none of them is checking what happens between keystrokes.
 */
async function fill(user: ReturnType<typeof userEvent.setup>, element: HTMLElement, text: string) {
  await user.click(element);
  await user.paste(text);
}

/** Says three things, which is what makes a summary worth offering. */
async function discussAnIdea(user: ReturnType<typeof userEvent.setup>) {
  const composer = screen.getByRole("textbox", { name: "Message Aura" });
  for (const message of [
    "I have an app idea for parents and school schedules.",
    "Right now they use WhatsApp groups and a paper diary.",
    "Parents on their phones, the school office on a laptop.",
  ]) {
    await fill(user, composer, message);
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(composer).toHaveValue(""));
  }
}

async function reachTheSummary(user: ReturnType<typeof userEvent.setup>) {
  await discussAnIdea(user);
  await user.click(await screen.findByRole("button", { name: /Summarise what I've told you/ }));
  await screen.findByRole("heading", { name: /what I understood/ });
}

async function reachTheContactStep(user: ReturnType<typeof userEvent.setup>) {
  await reachTheSummary(user);
  await user.click(screen.getByRole("button", { name: /That.s right/ }));
  await user.click(await screen.findByRole("button", { name: "Yes, send it" }));
  await screen.findByRole("heading", { name: /How should they reach you/ });
}

async function fillContactDetails(user: ReturnType<typeof userEvent.setup>) {
  // Typed rather than pasted: these are short, and a couple of them are the kind of field a
  // browser treats specially, so typing is both affordable here and closer to the real thing.
  await user.type(screen.getByLabelText("Your name"), "Priya Sharma");
  await user.type(screen.getByLabelText("Email address"), "priya@example.com");
  await user.type(screen.getByLabelText("Phone number"), "+91 98765 43210");
  await user.type(screen.getByLabelText("Country"), "India");
}

describe("Aura's project brief", () => {
  // --- when it is offered ---------------------------------------------------------------------

  it("offers nothing until a conversation is worth summarising", async () => {
    const briefs = new FakeBriefClient().withPeek({ readyToSummarise: false });
    const user = await openAura(new FakeAuraClient(), briefs);

    await fill(user, screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText("What are they doing today?");
    expect(screen.queryByRole("button", { name: /Summarise/ })).not.toBeInTheDocument();
  });

  it("costs no request at all in a two-turn conversation", async () => {
    // The backend decides whether a summary is worth offering, but there is no point asking it
    // about a conversation that has barely started.
    const briefs = new FakeBriefClient();
    const user = await openAura(new FakeAuraClient(), briefs);

    const composer = screen.getByRole("textbox", { name: "Message Aura" });
    await fill(user, composer, "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(composer).toHaveValue(""));

    expect(briefs.peeks).toBe(0);
  });

  it("offers a summary once the backend says the conversation is about a project", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await discussAnIdea(user);

    await screen.findByRole("button", { name: /Summarise what I've told you/ });
  });

  // --- the summary ----------------------------------------------------------------------------

  it("shows what Aura understood, in the visitor's own terms", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheSummary(user);

    expect(screen.getByText("Parents miss school schedule changes")).toBeInTheDocument();
    expect(screen.getByText("Parents, and the school office")).toBeInTheDocument();
    expect(screen.getByText("phones, laptop")).toBeInTheDocument();
  });

  it("shows what it does not know rather than leaving a gap", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheSummary(user);

    expect(screen.getByText(/How many schools/)).toBeInTheDocument();
    expect(screen.getByText(/Still to work out/)).toBeInTheDocument();
  });

  it("renders nothing for a field it has no answer for", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheSummary(user);

    // Nothing was said about timelines or constraints, so the summary says nothing about them —
    // rather than an empty row, a dash, or something plausible.
    expect(screen.queryByText("Timeline")).not.toBeInTheDocument();
    expect(screen.queryByText("Constraints")).not.toBeInTheDocument();
    expect(screen.queryByText("AI or automation")).not.toBeInTheDocument();
  });

  it("lets the visitor go back to talking instead of accepting it", async () => {
    const briefs = new FakeBriefClient();
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheSummary(user);

    await user.click(screen.getByRole("button", { name: "Change something" }));

    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: /what I understood/ })).not.toBeInTheDocument(),
    );
    expect(briefs.handoffs).toHaveLength(0);
    expect(screen.getByRole("textbox", { name: "Message Aura" })).toBeInTheDocument();
  });

  it("says so honestly when there is not enough to summarise yet", async () => {
    const briefs = new FakeBriefClient().withSummary({
      ok: true,
      value: { ...FULL_BRIEF, status: "DRAFT" },
    });
    const user = await openAura(new FakeAuraClient(), briefs);
    await discussAnIdea(user);
    await user.click(await screen.findByRole("button", { name: /Summarise/ }));

    await screen.findByText(/Tell me a little more first/);
    expect(screen.queryByRole("heading", { name: /what I understood/ })).not.toBeInTheDocument();
  });

  // --- consent --------------------------------------------------------------------------------

  it("asks for consent in plain words, on its own, before anything else", async () => {
    const briefs = new FakeBriefClient();
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheSummary(user);

    await user.click(screen.getByRole("button", { name: /That.s right/ }));

    await screen.findByRole("heading", {
      name: /Would you like me to send this to the AROORAA team as a project enquiry\?/,
    });
    // The question is the whole screen. No form is on it, so nothing else can be mistaken for
    // the answer.
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(briefs.handoffs).toHaveLength(0);
  });

  it("sends nothing when the visitor says not now", async () => {
    const briefs = new FakeBriefClient();
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheSummary(user);
    await user.click(screen.getByRole("button", { name: /That.s right/ }));

    await user.click(await screen.findByRole("button", { name: "Not now" }));

    await waitFor(() => expect(screen.queryByRole("heading", { name: /Would you like/ })).not.toBeInTheDocument());
    expect(briefs.handoffs).toHaveLength(0);
  });

  it("sends nothing merely because contact details were typed in", async () => {
    // The failure this whole flow is shaped to prevent. Details are collected only after consent,
    // and typing them is not what sends anything — pressing the button is.
    const briefs = new FakeBriefClient();
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheContactStep(user);

    await fillContactDetails(user);

    expect(briefs.handoffs).toHaveLength(0);
  });

  it("lets the visitor stop at the contact step", async () => {
    const briefs = new FakeBriefClient();
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheContactStep(user);
    await fillContactDetails(user);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument());
    expect(briefs.handoffs).toHaveLength(0);
  });

  // --- sending --------------------------------------------------------------------------------

  it("asks only for what the team needs in order to reply", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheContactStep(user);

    for (const label of ["Your name", "Email address", "Phone number", "Country"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    // No budget, no company size, no team size — none of which anybody needs in order to reply.
    for (const absent of [/budget/i, /company size/i, /how many people/i, /revenue/i]) {
      expect(screen.queryByText(absent)).not.toBeInTheDocument();
    }
  });

  it("cannot be sent until the required details are there", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheContactStep(user);

    expect(screen.getByRole("button", { name: "Send to the team" })).toBeDisabled();
    await fillContactDetails(user);
    expect(screen.getByRole("button", { name: "Send to the team" })).toBeEnabled();
  });

  it("sends the brief and shows the reference back", async () => {
    const briefs = new FakeBriefClient();
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheContactStep(user);
    await fillContactDetails(user);

    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    await screen.findByText("ARO-2026-000001");
    expect(briefs.handoffs).toHaveLength(1);
    expect(briefs.handoffs[0]!.contact.name).toBe("Priya Sharma");
    expect(briefs.handoffs[0]!.contact.preferredContactMethod).toBe("EMAIL");
  });

  it("points at the detail the backend objected to", async () => {
    const briefs = new FakeBriefClient().withHandoff({
      ok: false,
      kind: "INVALID_CONTACT",
      message: "That doesn't look like an email address.",
      field: "businessEmail",
    });
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheContactStep(user);
    await fillContactDetails(user);

    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    await screen.findByText(/doesn't look like an email address/);
    expect(screen.getByLabelText("Email address")).toHaveAttribute("aria-invalid", "true");
    // Still on the form, with everything they typed still there.
    expect(screen.getByLabelText("Your name")).toHaveValue("Priya Sharma");
  });

  it("never claims an enquiry was sent when it was not", async () => {
    const briefs = new FakeBriefClient().withHandoff({
      ok: false,
      kind: "UNAVAILABLE",
      message: "I can't pass this to the team from here just now.",
    });
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheContactStep(user);
    await fillContactDetails(user);

    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    await screen.findByText(/can.t pass this to the team/);
    expect(screen.queryByText(/That.s with the team/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ARO-2026/)).not.toBeInTheDocument();
  });

  it("says plainly when it cannot send at all, rather than offering a dead end", async () => {
    const briefs = new FakeBriefClient()
      .withPeek({ handoffAvailable: false })
      .withSummary({ ok: true, value: { ...FULL_BRIEF, handoffAvailable: false } });
    const user = await openAura(new FakeAuraClient(), briefs);
    await reachTheSummary(user);

    await user.click(screen.getByRole("button", { name: /That.s right/ }));

    await screen.findByRole("heading", { name: /can.t send this from here/ });
    expect(screen.queryByRole("button", { name: "Yes, send it" })).not.toBeInTheDocument();
  });

  // --- keeping the conversation usable ---------------------------------------------------------

  it("leaves the composer working throughout", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheSummary(user);

    // The brief is a card in the conversation, not a modal over it: the visitor can keep talking.
    expect(screen.getByRole("textbox", { name: "Message Aura" })).toBeEnabled();
  });

  it("lets the visitor keep focus in a field they are typing in", async () => {
    // A regression test for a real bug, and one that only became visible once the panel contained
    // a form. The panel focuses the composer when it opens; that effect shared a dependency array
    // with the key handler, whose dependency is rebuilt on every render — so "focus the composer"
    // ran on every render, and every keystroke in a contact field bounced focus back out of it.
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheContactStep(user);

    const name = screen.getByLabelText("Your name");
    await user.type(name, "Priya");

    expect(name).toHaveFocus();
    expect(name).toHaveValue("Priya");
  });

  it("keeps the summary inside the conversation the visitor can scroll", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeBriefClient());
    await reachTheSummary(user);

    const log = screen.getByRole("log", { name: "Conversation" });
    expect(within(log).getByRole("heading", { name: /what I understood/ })).toBeInTheDocument();
  });
});
