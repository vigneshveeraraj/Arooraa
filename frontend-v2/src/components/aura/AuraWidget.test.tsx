import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuraApiClient } from "@/lib/aura/client";
import type { AuraAnswer, AuraResult } from "@/lib/aura/types";
import { AURA_GUIDED_PRODUCTS, AURA_GUIDED_SERVICES } from "@/lib/aura/guided-entry";
import { AuraWidget } from "./AuraWidget";

const pathname = vi.fn(() => "/");
const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
  useRouter: () => ({ push }),
}));

/**
 * A scripted stand-in for aura-service. Every test here drives the real components through the
 * real controller and the real renderer — only the network is fake, which is the boundary worth
 * faking.
 */
class FakeAuraClient implements AuraApiClient {
  createCalls = 0;
  sent: { conversationId: string; message: string; currentPath: string | null }[] = [];
  private answers: AuraResult<AuraAnswer>[] = [];
  private createResult: AuraResult<{ conversationId: string; assistantProfile: string; channel: string }> = {
    ok: true,
    value: { conversationId: "c-1", assistantProfile: "AROORAA_WEBSITE", channel: "PUBLIC_WEB" },
  };
  /** Held open so a test can observe the thinking state before the answer lands. */
  private gate: (() => void) | null = null;

  answerWith(...results: AuraResult<AuraAnswer>[]) {
    this.answers.push(...results);
    return this;
  }

  failCreateWith(result: AuraResult<never>) {
    this.createResult = result;
    return this;
  }

  holdNextAnswer() {
    return new Promise<void>((resolve) => {
      this.gate = resolve;
    });
  }

  releaseAnswer() {
    this.gate?.();
    this.gate = null;
  }

  async createConversation() {
    this.createCalls += 1;
    if (this.createResult.ok) {
      return {
        ok: true as const,
        value: { ...this.createResult.value, conversationId: `c-${this.createCalls}` },
      };
    }
    return this.createResult;
  }

  async sendMessage(conversationId: string, message: string, currentPath: string | null) {
    this.sent.push({ conversationId, message, currentPath });
    if (this.gate) {
      await new Promise<void>((resolve) => {
        const previous = this.gate;
        this.gate = () => {
          previous?.();
          resolve();
        };
      });
    }
    return (
      this.answers.shift() ?? {
        ok: true as const,
        value: { conversationId, sequence: 1, answer: "Happy to help.", sources: [], diagnostics: null },
      }
    );
  }
}

function answer(text: string, sources: AuraAnswer["sources"] = [], diagnostics: AuraAnswer["diagnostics"] = null) {
  return { ok: true as const, value: { conversationId: "c-1", sequence: 1, answer: text, sources, diagnostics } };
}

async function openAura(client: AuraApiClient) {
  const user = userEvent.setup();
  render(<AuraWidget client={client} />);
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  // The panel is a real dynamic import, so opening it genuinely waits on a module. The budget for
  // that wait is set centrally in vitest.setup.ts — Testing Library's own 1s default is enough on
  // an idle machine and not enough under a loaded full-suite run.
  await screen.findByRole("dialog", { name: /Aura/ });
  return user;
}

function composer() {
  return screen.getByRole("textbox", { name: "Message Aura" });
}

beforeEach(() => {
  pathname.mockReturnValue("/");
  push.mockClear();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Aura on the website", () => {
  it("renders a launcher and nothing else until it is used", () => {
    const client = new FakeAuraClient();
    render(<AuraWidget client={client} />);

    expect(screen.getByRole("button", { name: "Ask Aura" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Browsing the site with Aura closed must not create a conversation on the backend.
    expect(client.createCalls).toBe(0);
  });

  it("opens and closes the panel, returning focus to the launcher", async () => {
    const user = await openAura(new FakeAuraClient());

    await user.click(screen.getByRole("button", { name: "Close Aura" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Ask Aura" })).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const user = await openAura(new FakeAuraClient());

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Ask Aura" })).toHaveFocus();
  });

  it("focuses the composer when opened so a visitor can just start typing", async () => {
    await openAura(new FakeAuraClient());

    expect(composer()).toHaveFocus();
  });

  it("only creates a conversation when the first message is sent", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);
    expect(client.createCalls).toBe(0);

    await user.type(composer(), "Hi Aura{Enter}");

    await waitFor(() => expect(client.createCalls).toBe(1));
    expect(window.sessionStorage.getItem("arooraa.aura.conversationId")).toBe("c-1");
  });

  it("renders the visitor's message immediately, then Aura's answer", async () => {
    const client = new FakeAuraClient().answerWith(answer("AROORAA builds its own products."));
    const user = await openAura(client);

    await user.type(composer(), "What is AROORAA?{Enter}");

    expect(await screen.findByText("What is AROORAA?")).toBeInTheDocument();
    expect(await screen.findByText("AROORAA builds its own products.")).toBeInTheDocument();
  });

  it("shows a thinking state while the answer is in flight", async () => {
    const client = new FakeAuraClient().answerWith(answer("Done."));
    void client.holdNextAnswer();
    const user = await openAura(client);

    await user.type(composer(), "What is MESA?{Enter}");

    expect(await screen.findByText("Thinking…")).toBeInTheDocument();
    client.releaseAnswer();
    expect(await screen.findByText("Done.")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Thinking…")).not.toBeInTheDocument());
  });

  // --- guided entry (A4.1) ----------------------------------------------------------------------

  it("shows the guided first-open menu rather than an empty composer", async () => {
    await openAura(new FakeAuraClient());

    expect(screen.getByText("Hi — what would you like to explore?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Services" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I have a product idea" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "About AROORAA" })).toBeInTheDocument();
  });

  it("opens the product choices, each carrying its own public name and tagline", async () => {
    const user = await openAura(new FakeAuraClient());

    await user.click(screen.getByRole("button", { name: "Products" }));

    for (const product of AURA_GUIDED_PRODUCTS) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(product.tagline)).toBeInTheDocument();
    }
  });

  it("opens the service choices — the six approved groups and none besides", async () => {
    const user = await openAura(new FakeAuraClient());

    await user.click(screen.getByRole("button", { name: "Services" }));

    expect(AURA_GUIDED_SERVICES).toHaveLength(6);
    for (const service of AURA_GUIDED_SERVICES) {
      expect(screen.getByText(service.name)).toBeInTheDocument();
    }
  });

  it.each(AURA_GUIDED_PRODUCTS)(
    "selecting $name navigates to its real route and keeps Aura open",
    async (product) => {
      const client = new FakeAuraClient().answerWith(answer(`${product.name} connects a restaurant.`));
      const user = await openAura(client);

      await user.click(screen.getByRole("button", { name: "Products" }));
      await user.click(screen.getByRole("button", { name: new RegExp(`^${product.name}`) }));

      expect(push).toHaveBeenCalledWith(product.href);
      // Aura's experience — the dialog, the conversation — survives the navigation.
      expect(screen.getByRole("dialog", { name: /Aura/ })).toBeInTheDocument();
      await waitFor(() => expect(client.sent[0]?.message).toBe(`Tell me about ${product.name}`));
    },
  );

  it.each(AURA_GUIDED_SERVICES)("selecting $name navigates to its real route", async (service) => {
    const client = new FakeAuraClient().answerWith(answer("Happy to help."));
    const user = await openAura(client);

    await user.click(screen.getByRole("button", { name: "Services" }));
    await user.click(screen.getByRole("button", { name: service.name }));

    expect(push).toHaveBeenCalledWith(service.href);
    await waitFor(() => expect(client.sent[0]?.message).toBe(`Tell me about ${service.name}`));
  });

  it('starts PROJECT_DISCOVERY directly for "I have a product idea", with no navigation', async () => {
    const client = new FakeAuraClient().answerWith(answer("What problem are you trying to solve?"));
    const user = await openAura(client);

    await user.click(screen.getByRole("button", { name: "I have a product idea" }));

    await waitFor(() => expect(client.sent[0]?.message).toBe("I have a product idea."));
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates for About/Careers/Contact without sending a message", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);

    await user.click(screen.getByRole("button", { name: "About AROORAA" }));

    expect(push).toHaveBeenCalledWith("/about");
    expect(client.sent).toHaveLength(0);
  });

  it('dismisses the guided menu on "Ask something else", focusing the composer', async () => {
    const user = await openAura(new FakeAuraClient());

    await user.click(screen.getByRole("button", { name: "Ask something else" }));

    expect(screen.queryByRole("button", { name: "Products" })).not.toBeInTheDocument();
    expect(composer()).toHaveFocus();
  });

  it("collapses the guided menu after the first message, and reopens it from Explore", async () => {
    const client = new FakeAuraClient().answerWith(answer("Happy to help."));
    const user = await openAura(client);

    await user.type(composer(), "Hi Aura{Enter}");
    await screen.findByText("Happy to help.");
    expect(screen.queryByRole("button", { name: "Products" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Explore" }));

    expect(screen.getByRole("button", { name: "Products" })).toBeInTheDocument();
    // The prior turns are still there — reopening the menu does not clear the conversation.
    expect(screen.getByText("Hi Aura")).toBeInTheDocument();
  });

  // --- page awareness --------------------------------------------------------------------------

  it("sends the current pathname with every message", async () => {
    pathname.mockReturnValue("/products/mesa");
    const client = new FakeAuraClient();
    const user = await openAura(client);

    await user.type(composer(), "Tell me more about this{Enter}");

    await waitFor(() => expect(client.sent[0]?.currentPath).toBe("/products/mesa"));
  });

  // --- composer --------------------------------------------------------------------------------

  it("will not send an empty or whitespace-only message", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    await user.type(composer(), "   {Enter}");

    expect(client.sent).toHaveLength(0);
  });

  it("blocks a second send while the first is still in flight", async () => {
    const client = new FakeAuraClient();
    void client.holdNextAnswer();
    const user = await openAura(client);

    await user.type(composer(), "First{Enter}");
    await screen.findByText("Thinking…");
    await user.type(composer(), "Second{Enter}");

    expect(client.sent).toHaveLength(1);
    client.releaseAnswer();
  });

  it("sends on Enter and writes a newline on Shift+Enter", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);

    await user.type(composer(), "line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(composer(), "line two");
    expect(client.sent).toHaveLength(0);
    expect(composer()).toHaveValue("line one\nline two");

    await user.keyboard("{Enter}");
    await waitFor(() => expect(client.sent[0]?.message).toBe("line one\nline two"));
    expect(composer()).toHaveValue("");
  });

  // --- what a visitor is shown (A4.2) ----------------------------------------------------------

  it("shows a grounded answer and none of the citations it arrived with", async () => {
    // The whole A4.2 finding, at the level a visitor experiences it: the answer comes back with
    // real citations attached, and the panel shows the answer.
    const client = new FakeAuraClient().answerWith(
      answer("MESA connects ordering and kitchen operations.", [
        { title: "MESA — Restaurant Technology Ecosystem", section: "What MESA does today", sourceUrl: null },
        { title: "AROORAA — Company Overview", section: null, sourceUrl: "https://arooraa.com/about" },
      ]),
    );
    const user = await openAura(client);

    await user.type(composer(), "What is MESA?{Enter}");
    await screen.findByText("MESA connects ordering and kitchen operations.");

    const dialog = screen.getByRole("dialog", { name: /Aura/ });
    expect(dialog.textContent).not.toContain("Sources");
    expect(dialog.textContent).not.toContain("MESA — Restaurant Technology Ecosystem");
    expect(dialog.textContent).not.toContain("What MESA does today");
    expect(dialog.querySelector('a[href="https://arooraa.com/about"]')).toBeNull();
  });

  it("never shows developer metadata on the real website, flag or no flag", async () => {
    // The inspector's gate is NODE_ENV === "development" && the flag. This suite runs under
    // NODE_ENV "test", so setting the flag here is the closest thing to a deployed site with a
    // stray environment variable — and it still shows a visitor nothing.
    vi.stubEnv("NEXT_PUBLIC_AURA_DIAGNOSTICS", "true");
    const client = new FakeAuraClient().answerWith(
      answer("MESA connects a restaurant.", [{ title: "MESA", section: "Overview", sourceUrl: null }], {
        mode: "GROUNDED_QA",
        evidenceLevel: "STRONG_EVIDENCE",
        language: "ENGLISH",
        tone: "NEUTRAL",
        latencyMs: 3739,
      }),
    );
    const user = await openAura(client);

    await user.type(composer(), "What is MESA?{Enter}");
    await screen.findByText("MESA connects a restaurant.");

    const dialog = screen.getByRole("dialog", { name: /Aura/ });
    for (const word of ["GROUNDED_QA", "STRONG_EVIDENCE", "ENGLISH", "NEUTRAL", "3739ms", "Sources"]) {
      expect(dialog.textContent, word).not.toContain(word);
    }
    expect(screen.queryByText("Dev")).not.toBeInTheDocument();
    expect(dialog.querySelector("details")).toBeNull();
  });

  // --- errors ----------------------------------------------------------------------------------

  it("explains a network failure calmly and offers a retry that works", async () => {
    const client = new FakeAuraClient()
      .answerWith(
        { ok: false, kind: "NETWORK", message: "I can't reach AROORAA from here right now.", retryable: true },
        answer("There we go — AROORAA builds its own products."),
      );
    const user = await openAura(client);

    await user.type(composer(), "What is AROORAA?{Enter}");
    expect(await screen.findByText(/can't reach AROORAA/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText(/There we go/)).toBeInTheDocument();
    // The visitor's message stays; only the failure notice is replaced.
    expect(screen.getByText("What is AROORAA?")).toBeInTheDocument();
    expect(screen.queryByText(/can't reach AROORAA/)).not.toBeInTheDocument();
  });

  it("does not offer a retry for a failure retrying cannot fix", async () => {
    const client = new FakeAuraClient().answerWith({
      ok: false,
      kind: "INVALID_INPUT",
      message: "That message is a bit long for me to take in one go.",
      retryable: false,
    });
    const user = await openAura(client);

    await user.type(composer(), "…{Enter}");

    expect(await screen.findByText(/a bit long for me/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });

  it("never reports a failed message as delivered", async () => {
    const client = new FakeAuraClient().answerWith({
      ok: false,
      kind: "SERVER",
      message: "Something went wrong on my side.",
      retryable: true,
    });
    const user = await openAura(client);

    await user.type(composer(), "What is MESA?{Enter}");

    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.queryByText("Happy to help.")).not.toBeInTheDocument();
  });

  it("recovers from a conversation the backend no longer knows", async () => {
    // The local backend restarting clears its database — the visitor should see an answer, not an
    // explanation of our persistence model.
    window.sessionStorage.setItem("arooraa.aura.conversationId", "stale-conversation");
    const client = new FakeAuraClient().answerWith(
      { ok: false, kind: "CONVERSATION_NOT_FOUND", message: "lost", retryable: false },
      answer("AROORAA builds its own products."),
    );
    const user = await openAura(client);

    await user.type(composer(), "What is AROORAA?{Enter}");

    expect(await screen.findByText("AROORAA builds its own products.")).toBeInTheDocument();
    expect(client.sent[0]?.conversationId).toBe("stale-conversation");
    expect(client.sent[1]?.conversationId).toBe("c-1");
    expect(screen.queryByText("lost")).not.toBeInTheDocument();
  });

  it("says something useful when the backend cannot be started at all", async () => {
    const client = new FakeAuraClient().failCreateWith({
      ok: false,
      kind: "UNAVAILABLE",
      message: "I'm not quite awake yet — my service doesn't seem to be running.",
      retryable: true,
    });
    const user = await openAura(client);

    await user.type(composer(), "Hi Aura{Enter}");

    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByText(/stack|Exception|500/i)).not.toBeInTheDocument();
  });

  // --- session ---------------------------------------------------------------------------------

  it("reuses the stored conversation for later messages in the same tab", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);

    await user.type(composer(), "Hi Aura{Enter}");
    await waitFor(() => expect(client.sent).toHaveLength(1));
    await user.type(composer(), "What is MESA?{Enter}");
    await waitFor(() => expect(client.sent).toHaveLength(2));

    expect(client.createCalls).toBe(1);
    expect(client.sent[1]?.conversationId).toBe("c-1");
  });

  it("starts a genuinely new conversation on request, keeping the panel open", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);

    await user.type(composer(), "Hi Aura{Enter}");
    await screen.findByText("Happy to help.");

    await user.click(screen.getByRole("button", { name: "New" }));

    expect(screen.getByRole("dialog", { name: /Aura/ })).toBeInTheDocument();
    expect(screen.queryByText("Hi Aura")).not.toBeInTheDocument();
    expect(screen.queryByText("Happy to help.")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("arooraa.aura.conversationId")).toBeNull();
    // The guided menu is back, because this really is an empty conversation.
    expect(screen.getByText("Hi — what would you like to explore?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Products" })).toBeInTheDocument();

    await user.type(composer(), "Hello again{Enter}");
    await waitFor(() => expect(client.createCalls).toBe(2));
    expect(client.sent[1]?.conversationId).toBe("c-2");
  });

  // --- safety and diagnostics ------------------------------------------------------------------

  it("renders an answer containing HTML as text, never as markup", async () => {
    const client = new FakeAuraClient().answerWith(
      answer('Careful: <script>alert("xss")</script> and <img src=x onerror=alert(1)>'),
    );
    const user = await openAura(client);

    await user.type(composer(), "Say something dangerous{Enter}");

    const dialog = await screen.findByRole("dialog", { name: /Aura/ });
    expect(
      await screen.findByText(/Careful: <script>alert\("xss"\)<\/script>/),
    ).toBeInTheDocument();
    expect(dialog.querySelector("script")).toBeNull();
    expect(dialog.querySelector("img")).toBeNull();
  });

  it("hides developer diagnostics by default", async () => {
    const client = new FakeAuraClient().answerWith(
      answer("MESA connects a restaurant.", [], {
        mode: "GROUNDED_QA",
        evidenceLevel: "STRONG_EVIDENCE",
        language: "ENGLISH",
        tone: "CURIOUS",
        latencyMs: 1420,
      }),
    );
    const user = await openAura(client);

    await user.type(composer(), "What is MESA?{Enter}");

    await screen.findByText("MESA connects a restaurant.");
    expect(screen.queryByText(/GROUNDED_QA/)).not.toBeInTheDocument();
    expect(screen.queryByText(/1420ms/)).not.toBeInTheDocument();
  });

  // --- accessibility ---------------------------------------------------------------------------

  it("exposes the conversation as a live region and the panel as a labelled dialog", async () => {
    await openAura(new FakeAuraClient());

    const dialog = screen.getByRole("dialog", { name: /Aura, AROORAA's digital assistant/ });
    const log = within(dialog).getByRole("log", { name: "Conversation" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("AROORAA digital assistant")).toBeInTheDocument();
  });

  it("keeps Tab inside the open panel", async () => {
    const user = await openAura(new FakeAuraClient());
    const dialog = screen.getByRole("dialog", { name: /Aura/ });

    for (let i = 0; i < 8; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });
});
