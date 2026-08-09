#!/usr/bin/env node
/**
 * Copies the static export (frontend/out/) into ../deploy/.
 *
 * Defaults to a dry run: it never touches deploy/ unless --write is passed.
 * It only copies files the static export itself produces (index.html,
 * _next/, favicon.svg, ...) — it never deletes anything already in deploy/,
 * so blog.html and smart-mirror.html are left untouched either way.
 */
import { existsSync, cpSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(frontendRoot, "..");
const outDir = path.join(frontendRoot, "out");
const deployDir = path.join(repoRoot, "deploy");

const write = process.argv.includes("--write");

if (!existsSync(outDir)) {
  console.error(`No static export found at ${outDir}. Run "npm run build" first.`);
  process.exit(1);
}

const entries = readdirSync(outDir);
console.log(`Static export ready at ${outDir} (${entries.length} top-level entries: ${entries.join(", ")}).`);
console.log(`Target: ${deployDir}`);

if (!write) {
  console.log("\nDry run only — no files were changed.");
  console.log("This will NOT delete blog.html, smart-mirror.html, or anything else already in deploy/;");
  console.log("it only copies/overwrites the files the static export itself produces.");
  console.log("\nRe-run with --write once the reconstructed home page has been visually verified:");
  console.log("  npm run build:deploy -- --write");
  process.exit(0);
}

cpSync(outDir, deployDir, { recursive: true });
console.log(`Copied ${outDir} -> ${deployDir}`);
