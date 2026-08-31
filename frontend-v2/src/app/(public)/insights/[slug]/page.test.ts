import { describe, expect, it } from "vitest";
import { generateMetadata } from "./page";
import { getAllArticles } from "@/lib/insights/articles";

describe("insight article metadata", () => {
  it("gives every article its own canonical URL, title and Article Open Graph type", async () => {
    for (const article of getAllArticles()) {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: article.slug }) });
      expect(metadata.alternates?.canonical).toBe(`/insights/${article.slug}`);
      expect(metadata.title).toBe(article.seoTitle);
      expect(metadata.openGraph).toMatchObject({
        type: "article",
        publishedTime: article.publishedDate,
      });
    }
  });

  it("returns empty metadata for an unknown slug rather than fabricating one", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "does-not-exist" }) });
    expect(metadata).toEqual({});
  });
});
