import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

/*
 * How long `findBy*` and `waitFor` are allowed to keep retrying.
 *
 * Testing Library's own default is one second, and it is separate from Vitest's test timeout — so
 * a test with a twenty-second budget still fails after one second if it is waiting on an element.
 * That is the second half of a flake that took two goes to pin down: raising `testTimeout` fixed
 * the tests that were doing too much work, and did nothing at all for the ones that were waiting
 * for a component to finish loading.
 *
 * Five seconds is not a licence for slow tests. It is the budget an asynchronous render needs on a
 * machine running three hundred test files at once, and it replaces the per-call `{ timeout: … }`
 * overrides that were accumulating in the Aura tests one flake at a time.
 */
configure({ asyncUtilTimeout: 5_000 });

/*
 * jsdom implements no layout engine, so it has no real answer for `window.matchMedia` and leaves it
 * undefined — anything that calls it (useAuraCompactViewport, at the moment) throws in every test
 * unless something defines it first. Defaulting every query to non-matching preserves the assumption
 * the whole suite was already written against (a wide/desktop viewport) without any test needing to
 * know this polyfill exists; a test that actually cares about a narrow viewport overrides
 * `window.matchMedia` itself, scoped to that test.
 */
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
}
