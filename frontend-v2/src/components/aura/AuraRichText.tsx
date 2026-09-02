import { Fragment } from "react";
import { parseAuraRichText, type AuraInline } from "@/lib/aura/rich-text";
import styles from "./AuraRichText.module.css";

/**
 * Renders an Aura answer as React elements built from a parsed model — never as HTML.
 *
 * <p>There is no `dangerouslySetInnerHTML` here and none anywhere else in the Aura UI. A response
 * containing `<script>alert(1)</script>` becomes a text node reading exactly that, which is both
 * safe and what a visitor would expect to see in a chat.
 */
export function AuraRichText({ text }: { text: string }) {
  const blocks = parseAuraRichText(text);

  return (
    <div className={styles.body}>
      {blocks.map((block, index) =>
        block.type === "list" ? (
          <ul key={index} className={styles.list}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inlines inlines={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={index} className={styles.paragraph}>
            <Inlines inlines={block.inlines} />
          </p>
        ),
      )}
    </div>
  );
}

function Inlines({ inlines }: { inlines: AuraInline[] }) {
  return (
    <>
      {inlines.map((inline, index) => {
        switch (inline.type) {
          case "strong":
            return <strong key={index}>{inline.text}</strong>;
          case "em":
            return <em key={index}>{inline.text}</em>;
          case "code":
            return (
              <code key={index} className={styles.code}>
                {inline.text}
              </code>
            );
          default:
            return <Fragment key={index}>{inline.text}</Fragment>;
        }
      })}
    </>
  );
}
