import { describe, expect, it, vi } from "vitest";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The internal review pages must not exist in a production build (A8).
 *
 * <p>`/design-system` and `/design-system/aura` are for looking at during development. Both carry
 * `robots: noindex`, and that was never enough: noindex asks a crawler not to list a page that is
 * nonetheless sitting on the server for anyone who types the URL. The Aura page is the sharper
 * case — it assembles states a visitor is never meant to see side by side, including a rendered
 * project brief and a consent screen out of context.
 *
 * <p>They are excluded by being named `page.review.tsx`, an extension that is a page extension only
 * in development. In a production build Next finds no `page` file in those directories, so there is
 * no route, nothing reaches `out/`, and the pages cannot be served because they are not there.
 *
 * <p>Two tests, because there are two ways to lose this: someone renames a file back to `page.tsx`,
 * or someone adds `review.tsx` to the production extension list. Neither would fail any other test
 * in this repository, and both would silently publish the pages.
 */

const DESIGN_SYSTEM = resolve(__dirname);

function pageFilesIn(directory: string): string[] {
  return readdirSync(directory).filter((name) => name.startsWith("page."));
}

describe("the internal review pages", () => {
  it("are named so that a production build does not see a route", () => {
    // A `page.tsx` here would be exported, and noindex would be the only thing between it and the
    // public — which is exactly the arrangement this replaced.
    expect(pageFilesIn(DESIGN_SYSTEM)).toEqual(
      expect.arrayContaining(["page.review.tsx"]),
    );
    expect(pageFilesIn(DESIGN_SYSTEM)).not.toContain("page.tsx");
    expect(pageFilesIn(resolve(DESIGN_SYSTEM, "aura"))).not.toContain("page.tsx");
  });

  it("are a route in development and not in a production build", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
    const dev = (await import("../../../next.config")).default;

    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    const production = (await import("../../../next.config")).default;
    vi.unstubAllEnvs();

    expect(dev.pageExtensions).toContain("review.tsx");
    expect(production.pageExtensions).not.toContain("review.tsx");
    // The defaults are not lost in the process: setting the key replaces the list rather than
    // adding to it, and every other page and layout in the app depends on them.
    for (const extension of ["tsx", "ts", "jsx", "js"]) {
      expect(dev.pageExtensions).toContain(extension);
      expect(production.pageExtensions).toContain(extension);
    }
  });
});
