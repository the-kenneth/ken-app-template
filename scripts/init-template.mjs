#!/usr/bin/env node
/**
 * One-time template initializer. Run after cloning:
 *
 *   pnpm init:template
 *
 * Prompts for your project details, then:
 *  - renames the @ken package scope everywhere
 *  - sets the Expo app name, slug, scheme and iOS/Android bundle IDs
 *  - optionally deletes the realtime-todos demo feature
 *  - deletes itself when done
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Interactive TTY → readline. Piped stdin (e.g. `printf "a\nb\n" | node …`)
// → consume all lines up front, since readline drops lines that arrive
// while no question is pending.
const interactive = process.stdin.isTTY;
const rl = interactive
  ? readline.createInterface({ input: process.stdin, output: process.stdout })
  : null;
const pipedAnswers = interactive ? [] : fs.readFileSync(0, "utf8").split("\n");

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".expo",
  ".convex",
  ".turbo",
  ".cache",
  "dist",
  "build",
  "ios",
  "android",
  "_generated",
]);

const REWRITABLE = /\.(ts|tsx|mts|js|jsx|mjs|json|yaml|yml|md|css|hbs)$/;

// The leftover audit reads everything that isn't one of these, so a file type
// missing from REWRITABLE gets reported rather than shipping a stale placeholder.
const BINARY =
  /\.(png|jpe?g|gif|webp|avif|ico|icns|ttf|otf|woff2?|mp4|mov|zip|gz|pdf|sqlite3?|db|keystore|jks)$/i;

function* walk(dir, matches) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name))
        yield* walk(path.join(dir, entry.name), matches);
    } else if (matches(entry.name)) {
      yield path.join(dir, entry.name);
    }
  }
}

function replaceInRepo(replacements) {
  for (const file of walk(root, (name) => REWRITABLE.test(name))) {
    const original = fs.readFileSync(file, "utf8");
    let updated = original;
    for (const [from, to] of replacements) {
      updated = updated.replaceAll(from, to);
    }
    if (updated !== original) fs.writeFileSync(file, updated);
  }
}

// A renamed scope lands in a different alphabetical slot than @ken did, and
// sherif (`pnpm lint:ws`) fails CI on unsorted dependency blocks.
function sortDependencyBlocks() {
  const blocks = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];
  for (const file of walk(root, (name) => name === "package.json")) {
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    let changed = false;
    for (const block of blocks) {
      const entries = Object.entries(pkg[block] ?? {});
      const sorted = entries.toSorted(([a], [b]) =>
        a < b ? -1 : a > b ? 1 : 0,
      );
      if (sorted.some(([key], i) => key !== entries[i][0])) {
        pkg[block] = Object.fromEntries(sorted);
        changed = true;
      }
    }
    if (changed) fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
  }
}

// Drift between the template and this script's exact-literal edits, collected
// rather than thrown so one stale pattern doesn't abandon a half-renamed repo.
const warnings = [];

function editFile(relPath, edits) {
  const filePath = path.join(root, relPath);
  let content = fs.readFileSync(filePath, "utf8");
  for (const [pattern, replacement] of edits) {
    const updated =
      typeof pattern === "string"
        ? content.replaceAll(pattern, replacement)
        : content.replace(pattern, replacement);
    if (updated === content)
      warnings.push(`  ${relPath}: no match for ${pattern}`);
    content = updated;
  }
  fs.writeFileSync(filePath, content);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ask(question, fallback, validate) {
  for (;;) {
    const raw = rl
      ? await rl.question(`${question} (${fallback}): `)
      : (pipedAnswers.shift() ?? "");
    const trimmed = raw.trim();
    const answer = trimmed.length > 0 ? trimmed : fallback;
    const problem = validate?.(answer);
    if (!problem) return answer;
    if (!rl) throw new Error(`Invalid answer "${answer}": ${problem}`);
    console.log(`  ✗ ${problem}`);
  }
}

const displayName = await ask("App display name", "My App");
const defaultSlug = slugify(displayName);
const slug = await ask("Slug / scheme (lowercase, dashes)", defaultSlug, (v) =>
  /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(v)
    ? undefined
    : "use lowercase letters, digits and dashes, starting with a letter",
);
const scope = await ask(
  "Package scope (without @)",
  slug.replaceAll("-", ""),
  (v) =>
    /^[a-z0-9][a-z0-9._-]*$/.test(v)
      ? undefined
      : "npm scopes are lowercase letters, digits, ., _ and -",
);
const bundleId = await ask(
  "iOS bundle ID / Android package",
  `com.${scope}.app`,
  (v) =>
    /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(v)
      ? undefined
      : "use reverse-DNS with 2+ dot-separated segments, each starting with a letter (Android forbids dashes)",
);
const removeDemo =
  (
    await ask("Remove the realtime-todos demo feature? y/n", "n")
  ).toLowerCase() === "y";

rl?.close();

console.log("\nRewriting placeholders…");
const replacements = [
  ["@ken/", `@${scope}/`],
  ["ken-app-template", `${slug}-monorepo`],
  ['"ken-app"', `"${slug}"`],
  ["com.ken.app", bundleId],
  ['name: "Ken"', `name: "${displayName}"`],
  ["Ken <span", `${displayName} <span`],
  ['title: "Ken"', `title: "${displayName}"`],
];
replaceInRepo(replacements);
sortDependencyBlocks();

// The README's template-meta parts don't belong in the new project: retitle
// it and drop the "Start a new project" / placeholder-list sections.
console.log("Updating README…");
const readmePath = path.join(root, "README.md");
let readme = fs.readFileSync(readmePath, "utf8");
readme = readme
  .replace(
    "# App Template — Next.js + Expo + Convex + Clerk",
    `# ${displayName}`,
  )
  .replace("A monorepo template for shipping", "A monorepo shipping")
  .replace(/## Start a new project\n[\s\S]*?(?=^## )/m, "")
  .replace(/\nPlaceholders rewritten by `pnpm init:template`[^\n]*\n/, "");
fs.writeFileSync(readmePath, readme);

if (removeDemo) {
  console.log("Removing the todos demo…");
  const demoFiles = [
    "packages/backend/convex/todos.ts",
    "packages/backend/convex/todos.test.ts",
    "packages/backend/convex/tables/todos.ts",
    "apps/nextjs/src/app/_components/todos.tsx",
    "apps/expo/src/features/todos/components/todos.tsx",
    "apps/expo/src/features/todos/todo-filter.ts",
  ];
  for (const file of demoFiles) {
    fs.rmSync(path.join(root, file), { force: true });
  }

  // schema.ts: drop the todos table (tables/todos.ts was deleted above)
  editFile("packages/backend/convex/schema.ts", [
    ['import { todosTable } from "./tables/todos";\n', ""],
    [/\n\s*todos: todosTable,/, ""],
  ]);

  // _generated/api.d.ts is committed so typecheck works before the first
  // `convex dev`; drop the todos module references it still carries.
  // (Regenerated automatically once `pnpm dev:backend` runs.)
  editFile("packages/backend/convex/_generated/api.d.ts", [
    ['import type * as todos from "../todos.js";\n', ""],
    [/\n\s*todos: typeof todos;/, ""],
  ]);

  // analytics: drop the todos demo event and its doc example
  editFile("packages/analytics/src/index.ts", [
    [/\n\s*todo_added: \{ platform: Platform \};/, ""],
    ['track("todo_added"', 'track("user_signed_in"'],
  ]);

  // users.ts: drop the todos cleanup inside deleteFromClerk
  editFile("packages/backend/convex/users.ts", [
    [
      /\n    const todos = await ctx\.db[\s\S]*?todos\.map\(\(todo\) => ctx\.db\.delete\(todo\._id\)\)\);\n/,
      "\n",
    ],
  ]);

  // Web auth gate: drop the todos import and usage
  editFile("apps/nextjs/src/app/_components/auth-gate.tsx", [
    [/\nimport { Todos } from ".\/todos";\n/, "\n"],
    [/\n\s*<Todos \/>/, ""],
  ]);

  // Expo home screen: drop the todos import and usage
  editFile("apps/expo/src/app/index.tsx", [
    [
      /\nimport { Todos } from "~\/features\/todos\/components\/todos";\n/,
      "\n",
    ],
    [/\n\s*<Todos \/>/, ""],
  ]);
}

console.log("Refreshing lockfile…");
try {
  execSync("pnpm install", { cwd: root, stdio: "inherit" });
} catch {
  console.warn("pnpm install failed — run it manually after fixing the issue.");
}

console.log("Cleaning up…");
fs.rmSync(path.join(root, "scripts/init-template.mjs"), { force: true });
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
delete pkg.scripts["init:template"];
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// A scope of a different length re-flows import wrapping and markdown table
// padding, which the format job rejects.
console.log("Formatting…");
try {
  execSync("pnpm format:fix", { cwd: root, stdio: "inherit" });
} catch {
  console.warn("pnpm format:fix failed — run it manually.");
}

// The rewrites above match exact literals, so drift in the template source
// makes them silently no-op. Catch that here rather than in the new project.
for (const file of walk(root, (name) => !BINARY.test(name))) {
  const content = fs.readFileSync(file, "utf8");
  for (const [from, to] of replacements) {
    if (from !== to && content.includes(from)) {
      warnings.push(`  ${path.relative(root, file)}: leftover ${from}`);
    }
  }
}
if (warnings.length > 0) {
  console.warn(
    "\n⚠ The template has drifted from this script. Fix these by hand, then" +
      " update scripts/init-template.mjs in the template repo:\n" +
      warnings.join("\n"),
  );
}

console.log(`
Done! Next steps:
  1. cp .env.example .env  (then fill it in — see README)
  2. pnpm dev:backend      (creates your Convex project on first run)
  3. pnpm dev:next / pnpm ios
`);
