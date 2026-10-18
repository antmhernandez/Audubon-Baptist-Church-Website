/**
 * Audubon Baptist Church — dependency-free source validation.
 *
 * Run locally with: node scripts/validate-site.mjs
 * GitHub Actions runs the same checks on proposed changes.
 *
 * Intentionally conservative: syntactic/link checks are NOT a substitute
 * for human browser/accessibility/production security testing.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const pages = [
  "index.html", "visit.html", "sermons.html", "beliefs.html",
  "about.html", "archive.html", "give.html", "app.html",
  "member.html", "calendar.html", "admin.html", "media-studio.html"
];
const jsFiles = [
  "site.js", "app.js", "sermons.js", "sermon-catalog.js",
  "live-status.js", "member.js", "calendar.js", "admin.js",
  "media-studio.js", "pwa.js", "sw.js"
];
const pairs = [
  ["index.html", "app.js"],
  ["sermons.html", "sermons.js"],
  ["member.html", "member.js"],
  ["calendar.html", "calendar.js"],
  ["admin.html", "admin.js"],
  ["media-studio.html", "media-studio.js"]
];
const errors = [];
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const knownFiles = name => fs.existsSync(path.join(root, name));

for (const name of [...pages, ...jsFiles, "manifest.webmanifest", "sermon-catalog.json"]) {
  if (!knownFiles(name)) errors.push("Missing required file: " + name);
}

for (const file of jsFiles) {
  const checked = spawnSync(process.execPath, ["--check", path.join(root, file)], {
    encoding: "utf8"
  });
  if (checked.status !== 0) errors.push(file + ": " + checked.stderr.slice(0, 250));
}

// Cloudflare Pages Function uses ESM syntax even though the root project
// does not need a package.json with type=module.
const worker = spawnSync(process.execPath,
  ["--input-type=module", "--check"],
  { input: read("functions/api/live.js"), encoding: "utf8" });
if (worker.status !== 0) errors.push("functions/api/live.js: " + worker.stderr.slice(0, 250));

for (const file of ["manifest.webmanifest", "sermon-catalog.json"]) {
  try { JSON.parse(read(file)); }
  catch (error) { errors.push(file + ": " + error.message); }
}

for (const page of pages) {
  const html = read(page);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const id of new Set(duplicateIds)) errors.push(page + ": duplicate ID " + id);

  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const target = match[1].split("#")[0].split("?")[0];
    if (!target || /^(https?:|tel:|mailto:|data:|javascript:|\/)/i.test(target)) continue;
    if (!knownFiles(target)) errors.push(page + ": broken relative link " + target);
  }
}

for (const [page, script] of pairs) {
  const html = read(page);
  const code = read(script);
  const ids = [...new Set(
    [...code.matchAll(/getElementById\(["']([^"']+)["']\)/g)]
      .map(match => match[1])
  )];
  for (const id of ids) {
    if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
      errors.push(script + " references missing " + page + " ID " + id);
    }
  }
}

const css = read("styles.css");
if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) {
  errors.push("styles.css: unmatched curly braces");
}

if (errors.length) {
  console.error("Audubon validation failed:\n" + errors.map(x => " - " + x).join("\n"));
  process.exit(1);
}
console.log("Audubon checks passed: JS syntax, HTML IDs and links, JSON, CSS braces.");
