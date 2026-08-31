import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SERVICE_LINKS,
  PRIMARY_NAV_LINKS,
  START_PROJECT_LINK,
} from "./navigation";

/**
 * W4.1 Phase 14 — a deterministic broken-link audit for the header/footer
 * nav: derives the real set of generated routes from `src/app`'s actual
 * page.tsx files (so this stays correct as pages are added/removed) and
 * checks every nav href resolves to one of them, instead of hand-maintaining
 * a second list that can silently drift from the filesystem.
 */
function discoverRoutes(dir: string, base = ""): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      const segment = entry.startsWith("(") && entry.endsWith(")") ? "" : `/${entry}`;
      routes.push(...discoverRoutes(fullPath, base + segment));
    } else if (entry === "page.tsx") {
      routes.push(base === "" ? "/" : base);
    }
  }
  return routes;
}

const APP_DIR = join(__dirname, "../../app");
const REAL_ROUTES = discoverRoutes(APP_DIR);

function routeExists(href: string): boolean {
  const path = href.split("#")[0] ?? href;
  if (REAL_ROUTES.includes(path)) return true;
  // Dynamic segments (e.g. /careers/[slug]) match any single-segment child of their parent.
  return REAL_ROUTES.some((route) => {
    if (!route.includes("[")) return false;
    const routeParts = route.split("/");
    const hrefParts = path.split("/");
    if (routeParts.length !== hrefParts.length) return false;
    return routeParts.every((part, i) => part.startsWith("[") || part === hrefParts[i]);
  });
}

describe("header/footer navigation links resolve to real routes", () => {
  const allLinks = [
    ...PRIMARY_NAV_LINKS,
    START_PROJECT_LINK,
    ...FOOTER_PRODUCT_LINKS,
    ...FOOTER_SERVICE_LINKS,
    ...FOOTER_COMPANY_LINKS,
  ];

  it.each(allLinks)("$label -> $href", ({ href }) => {
    expect(routeExists(href)).toBe(true);
  });

  it("found a non-trivial number of real routes to check against", () => {
    // Guards against the filesystem walk silently finding nothing and every
    // check above passing for the wrong reason.
    expect(REAL_ROUTES.length).toBeGreaterThan(20);
  });
});
