"use client";

import { safeSourceUrl } from "@/lib/aura/client";
import type { AuraTranscriptMessage } from "@/lib/aura/types";
import styles from "./AuraDevInspector.module.css";

interface AuraDevInspectorProps {
  /** The most recent Aura turn, or null when there is nothing to inspect yet. */
  turn: AuraTranscriptMessage | null;
  /** Only the design-system review page sets this, so a capture shows the contents rather than a
   * closed bar. In use it stays open once opened, because the element is never remounted. */
  defaultOpen?: boolean;
}

/**
 * The one place routing metadata and citations are shown, and it is not a visitor surface.
 *
 * <p>A4.2 removed both from the conversation itself: a public visitor was reading
 * "Sources · 3" and "GROUNDED_QA · STRONG_EVIDENCE · ENGLISH · NEUTRAL · 3739ms" under Aura's
 * answers, which is our retrieval implementation described in our own vocabulary. None of it is
 * gone from the backend — it is still tracked, still asserted in tests, still what grounding and
 * auditing depend on. It simply stops being part of what a visitor is shown.
 *
 * <p>Deliberately shows the <em>latest</em> turn only, in one collapsed disclosure, rather than a
 * block under every answer: a developer checking whether an answer was grounded is asking about
 * the answer they just got. A native {@code <details>} does the collapsing, so the closed state is
 * neither announced nor focusable beyond its own summary, and there is no ARIA to get wrong.
 *
 * <p>This component never renders on a public build — see {@code AuraWidget} for the gate, which
 * is two build-time constants and therefore resolves to {@code false} before the bundler runs.
 */
export function AuraDevInspector({ turn, defaultOpen = false }: AuraDevInspectorProps) {
  const diagnostics = turn?.diagnostics ?? null;
  const sources = turn?.sources ?? [];
  if (!diagnostics && sources.length === 0) return null;

  const rows: { label: string; value: string }[] = [];
  if (diagnostics?.mode) rows.push({ label: "mode", value: diagnostics.mode });
  if (diagnostics?.evidenceLevel) rows.push({ label: "evidence", value: diagnostics.evidenceLevel });
  if (diagnostics?.language) rows.push({ label: "language", value: diagnostics.language });
  if (diagnostics?.tone) rows.push({ label: "tone", value: diagnostics.tone });
  if (diagnostics?.latencyMs != null) rows.push({ label: "latency", value: `${diagnostics.latencyMs}ms` });
  if (diagnostics?.guardrail) rows.push({ label: "guardrail", value: diagnostics.guardrail });

  return (
    <details className={styles.inspector} open={defaultOpen || undefined}>
      <summary className={styles.summary}>Dev</summary>
      <div className={styles.body}>
        {rows.length > 0 ? (
          <dl className={styles.rows}>
            {rows.map((row) => (
              <div key={row.label} className={styles.row}>
                <dt className={styles.label}>{row.label}</dt>
                <dd className={styles.value}>{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {sources.length > 0 ? (
          <ul className={styles.sources}>
            {sources.map((source, index) => {
              const url = safeSourceUrl(source.sourceUrl);
              return (
                <li key={`${source.title}-${index}`} className={styles.source}>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer noopener">
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                  {source.section ? <span className={styles.section}>{source.section}</span> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
