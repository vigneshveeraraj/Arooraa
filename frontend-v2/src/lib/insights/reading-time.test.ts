import { describe, expect, it } from "vitest";
import { countWords, estimateReadingMinutes, formatReadingTime } from "./reading-time";
import type { InsightArticleSection } from "./types";

describe("reading time", () => {
  it("counts words across headings and paragraphs", () => {
    const sections: InsightArticleSection[] = [
      { heading: "One two", paragraphs: ["three four five"] },
      { paragraphs: ["six seven"] },
    ];
    expect(countWords(sections)).toBe(7);
  });

  it("estimates a minimum of 1 minute even for very short content", () => {
    expect(estimateReadingMinutes([{ paragraphs: ["one two three"] }])).toBe(1);
  });

  it("derives reading time from word count at 200 words per minute", () => {
    const words = Array.from({ length: 401 }, () => "word").join(" ");
    expect(estimateReadingMinutes([{ paragraphs: [words] }])).toBe(3);
  });

  it("formats reading time consistently", () => {
    expect(formatReadingTime(1)).toBe("1 min read");
    expect(formatReadingTime(7)).toBe("7 min read");
  });
});
