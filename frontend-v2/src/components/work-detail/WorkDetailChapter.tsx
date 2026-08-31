import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./WorkDetailChapter.module.css";

interface WorkDetailChapterProps {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  supporting?: string;
  tone?: "light" | "dark";
  width?: "wide" | "content";
  /**
   * W2.1.1 — an optional, subtle act marker (e.g. "ACT 1 — UNDERSTANDING
   * THE RESTAURANT") rendered above this chapter's own eyebrow, for the one
   * chapter that opens each of a story's broader narrative movements.
   * Omitted on every other chapter, so nothing else changes appearance.
   */
  actLabel?: string;
  children?: ReactNode;
}

/**
 * The shared chapter frame for an Our Work engineering story (W2.1) — a
 * consistent number/eyebrow/heading/supporting header, a light or dark
 * tone, and one open `children` slot for whatever bespoke visual or
 * composition the chapter actually needs. This is deliberately the entire
 * shared surface for chapter content: every chapter's storytelling
 * component (the picture, the scene, the diagram) is page-specific and
 * lives in components/work-detail/mesa/ (or a future project's own
 * folder), never inside this file — so future engineering stories can
 * reuse this frame without inheriting MESA's own visual structure.
 */
export function WorkDetailChapter({ id, index, eyebrow, title, supporting, tone = "light", width = "wide", actLabel, children }: WorkDetailChapterProps) {
  return (
    <Section id={id} tone={tone} spacing="default" as="section">
      <Container width={width}>
        <div className={styles.container}>
          <div className={styles.head}>
            {actLabel ? <p className={styles.actLabel}>{actLabel}</p> : null}
            <p className={styles.index} aria-hidden="true">
              {index}
            </p>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className={`text-h1 ${styles.title}`}>{title}</h2>
            {supporting ? <p className={`text-body-lg ${styles.supporting}`}>{supporting}</p> : null}
          </div>
          {children ? <div className={styles.body}>{children}</div> : null}
        </div>
      </Container>
    </Section>
  );
}
