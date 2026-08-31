import type { InsightArticleSection } from "./types";

const WORDS_PER_MINUTE = 200;

/**
 * Reading time is always derived from the actual article body — never a
 * hand-typed guess (Phase 4: "readingTime?" stays computed, not authored).
 */
export function countWords(content: InsightArticleSection[]): number {
  return content.reduce((total, section) => {
    const headingWords = section.heading ? section.heading.trim().split(/\s+/).length : 0;
    const paragraphWords = section.paragraphs.reduce(
      (sum, paragraph) => sum + paragraph.trim().split(/\s+/).filter(Boolean).length,
      0,
    );
    return total + headingWords + paragraphWords;
  }, 0);
}

export function estimateReadingMinutes(content: InsightArticleSection[]): number {
  return Math.max(1, Math.ceil(countWords(content) / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
