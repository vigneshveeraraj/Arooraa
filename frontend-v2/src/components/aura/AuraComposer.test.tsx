import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuraComposer } from "./AuraComposer";

/**
 * The composer grows with the message and stops at a ceiling. jsdom computes no layout, so
 * `scrollHeight` is stubbed to stand in for "the content is this tall" — which is exactly the
 * quantity the component reads to decide whether a scrollbar is warranted.
 */
function stubScrollHeight(textarea: HTMLTextAreaElement, height: number) {
  Object.defineProperty(textarea, "scrollHeight", { configurable: true, value: height });
}

function composer() {
  return screen.getByRole("textbox", { name: "Message Aura" }) as HTMLTextAreaElement;
}

describe("the Aura composer", () => {
  it("shows no scrollbar chrome for a message that fits", async () => {
    // The owner's screenshot showed native scroll arrows beside a one-line message: a textarea
    // reserves that chrome as soon as overflow is `auto`, whether or not it has anything to scroll.
    const user = userEvent.setup();
    render(<AuraComposer onSend={() => {}} onActiveChange={() => {}} busy={false} />);

    stubScrollHeight(composer(), 40);
    await user.type(composer(), "Hi");

    expect(composer().style.overflowY).toBe("hidden");
  });

  it("scrolls only once the message outgrows the ceiling", async () => {
    const user = userEvent.setup();
    render(<AuraComposer onSend={() => {}} onActiveChange={() => {}} busy={false} />);

    stubScrollHeight(composer(), 400);
    await user.type(composer(), "A very long message");

    expect(composer().style.overflowY).toBe("auto");
    // And the box itself stops growing at the ceiling rather than eating the conversation.
    expect(composer().style.height).toBe("132px");
  });

  it("still sends on Enter and still writes a newline on Shift+Enter", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<AuraComposer onSend={onSend} onActiveChange={() => {}} busy={false} />);

    await user.type(composer(), "line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(composer(), "line two");
    expect(onSend).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    // "TYPED" is how A5 marks where a message came from — it decides only whether Aura reads its
    // answer aloud, never how the message is understood.
    expect(onSend).toHaveBeenCalledWith("line one\nline two", "TYPED");
  });
});
