import { describe, expect, it } from "vitest";
import { parseAuraRichText, parseInlines } from "./rich-text";

describe("Aura rich text", () => {
  it("splits blank-line-separated prose into paragraphs", () => {
    const blocks = parseAuraRichText("MESA connects a restaurant.\n\nIt is multi-tenant SaaS.");

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ type: "paragraph", inlines: [{ type: "text", text: "MESA connects a restaurant." }] });
    expect(blocks[1]).toEqual({ type: "paragraph", inlines: [{ type: "text", text: "It is multi-tenant SaaS." }] });
  });

  it("joins wrapped lines into one paragraph", () => {
    const blocks = parseAuraRichText("MESA connects ordering\nand kitchen operations.");

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      type: "paragraph",
      inlines: [{ text: "MESA connects ordering and kitchen operations." }],
    });
  });

  it("collects a run of bullets into a single list", () => {
    const blocks = parseAuraRichText("What it does:\n\n- Digital Dining\n- Kitchen Coordination\n* Billing");

    expect(blocks).toHaveLength(2);
    expect(blocks[1]).toMatchObject({ type: "list" });
    expect(blocks[1]).toHaveProperty("items");
    const list = blocks[1] as { items: { text: string }[][] };
    expect(list.items.map((item) => item[0]?.text)).toEqual([
      "Digital Dining",
      "Kitchen Coordination",
      "Billing",
    ]);
  });

  it("reads bold, italic and inline code", () => {
    expect(parseInlines("MESA is our **flagship** product")).toEqual([
      { type: "text", text: "MESA is our " },
      { type: "strong", text: "flagship" },
      { type: "text", text: " product" },
    ]);
    expect(parseInlines("that is _quite_ different")).toContainEqual({ type: "em", text: "quite" });
    expect(parseInlines("run `npm test` first")).toContainEqual({ type: "code", text: "npm test" });
  });

  it("treats HTML as ordinary characters, never as markup", () => {
    // The parser has no concept of a tag, which is why the renderer can build React elements from
    // its output and never needs dangerouslySetInnerHTML.
    const blocks = parseAuraRichText('<script>alert(1)</script> and <img src=x onerror=alert(2)>');

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      type: "paragraph",
      inlines: [{ type: "text", text: '<script>alert(1)</script> and <img src=x onerror=alert(2)>' }],
    });
  });

  it("survives empty and whitespace-only answers", () => {
    expect(parseAuraRichText("")).toEqual([]);
    expect(parseAuraRichText("   \n\n  ")).toEqual([]);
  });
});
