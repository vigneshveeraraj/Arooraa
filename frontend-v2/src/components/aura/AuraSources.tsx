"use client";

import { useId, useState } from "react";
import { safeSourceUrl } from "@/lib/aura/client";
import type { AuraSource } from "@/lib/aura/types";
import styles from "./AuraSources.module.css";

/**
 * Citations, collapsed by default.
 *
 * <p>A grounded answer should read as an answer, not as a search result page — so the default
 * state is one quiet line, and the references are there for the visitor who wants to check. When
 * an answer has no sources (small talk, a boundary turn, general consulting) this renders nothing
 * at all rather than an empty section.
 *
 * <p>Only three fields exist to render: title, section and a public URL. There is no field here
 * for a score, an identifier or a knowledge space, so none can be shown by mistake.
 */
export function AuraSources({
  sources,
  defaultExpanded = false,
}: {
  sources: AuraSource[];
  /** Only the design-system review page sets this, so the expanded state can be seen at a glance. */
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const listId = useId();

  if (sources.length === 0) return null;

  return (
    <div className={styles.sources}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls={listId}
      >
        <span className={styles.chevron} data-expanded={expanded} aria-hidden="true" />
        Sources · {sources.length}
      </button>
      {expanded ? (
        <ul id={listId} className={styles.list}>
          {sources.map((source, index) => {
            const url = safeSourceUrl(source.sourceUrl);
            return (
              <li key={`${source.title}-${index}`} className={styles.item}>
                <span className={styles.title}>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer noopener">
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </span>
                {source.section ? <span className={styles.section}>{source.section}</span> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
