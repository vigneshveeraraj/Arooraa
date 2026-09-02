/**
 * Turns an Aura answer into a small, closed document model.
 *
 * <p>Model output is untrusted text. It is parsed here into paragraphs, list items and inline runs,
 * and rendered as React elements — never as HTML. There is no `dangerouslySetInnerHTML` anywhere in
 * the Aura UI, so a response containing `<script>` or `<img onerror=...>` renders as the literal
 * characters a visitor would see in a chat app, which is both safe and correct.
 *
 * <p>The supported subset is deliberately tiny: paragraphs, bullet lists, bold, italic and inline
 * code. No headings, no tables, no images, no raw links. Aura's answers are conversation, and a
 * markdown feature nobody needs is a parser branch nobody has tested.
 */

export type AuraInline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "code"; text: string };

export type AuraBlock =
  | { type: "paragraph"; inlines: AuraInline[] }
  | { type: "list"; items: AuraInline[][] };

const BULLET = /^\s*([-*•])\s+(.*)$/;

/** Matches `**bold**`, `*italic*`/`_italic_`, and `` `code` `` — nothing else is markup. */
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g;

export function parseInlines(text: string): AuraInline[] {
  const inlines: AuraInline[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      inlines.push({ type: "text", text: text.slice(lastIndex, start) });
    }
    if (token.startsWith("**")) {
      inlines.push({ type: "strong", text: token.slice(2, -2) });
    } else if (token.startsWith("`")) {
      inlines.push({ type: "code", text: token.slice(1, -1) });
    } else {
      inlines.push({ type: "em", text: token.slice(1, -1) });
    }
    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    inlines.push({ type: "text", text: text.slice(lastIndex) });
  }
  return inlines.length > 0 ? inlines : [{ type: "text", text }];
}

/**
 * Blank lines separate paragraphs; a run of bullet lines becomes one list. A single newline inside
 * a paragraph is treated as a space, the way a chat client renders wrapped prose.
 */
export function parseAuraRichText(answer: string): AuraBlock[] {
  const blocks: AuraBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", inlines: parseInlines(paragraph.join(" ").trim()) });
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: listItems.map((item) => parseInlines(item)) });
    listItems = [];
  };

  for (const rawLine of (answer ?? "").replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();
    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = BULLET.exec(line);
    if (bullet?.[2] !== undefined) {
      flushParagraph();
      listItems.push(bullet[2].trim());
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();

  return blocks;
}
