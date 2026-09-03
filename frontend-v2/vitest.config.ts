import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: true,
    /*
     * Raised from the 5s default, deliberately and after finding out why it mattered.
     *
     * This suite runs three hundred files in parallel on the same cores. Most tests finish in
     * milliseconds, but a few render a whole page — the careers listing, for one — and under that
     * much contention a single render can genuinely take longer than five seconds. Those tests
     * were failing intermittently and passing alone, which is the signature of a budget that is
     * too tight rather than of a test that is wrong.
     *
     * This is not a substitute for making tests cheap. The forms that were the worst offenders now
     * paste their input instead of simulating every keystroke, which removed the actual waste; see
     * the helpers in ContactForm.test.tsx and JobApplyPanel.test.tsx. What is left is work that
     * has to happen, and this is the budget it needs on a loaded machine.
     */
    testTimeout: 20_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
