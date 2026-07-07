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
  ".turbo",
  ".cache",
  "dist",
  "build",
  "ios",
  "android",
  "_generated",
]);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name))
        yield* walk(path.join(dir, entry.name));
    } else if (
      /\.(ts|tsx|mts|js|jsx|mjs|json|yaml|yml|md|hbs)$/.test(entry.name)
    ) {
      yield path.join(dir, entry.name);
    }
  }
}

function replaceInRepo(replacements) {
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, "utf8");
    let updated = original;
    for (const [from, to] of replacements) {
      updated = updated.replaceAll(from, to);
    }
    if (updated !== original) fs.writeFileSync(file, updated);
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ask(question, fallback) {
  const raw = rl
    ? await rl.question(`${question} (${fallback}): `)
    : (pipedAnswers.shift() ?? "");
  const answer = raw.trim();
  return answer.length > 0 ? answer : fallback;
}

const displayName = await ask("App display name", "My App");
const defaultSlug = slugify(displayName);
const slug = await ask("Slug / scheme (lowercase, dashes)", defaultSlug);
const scope = await ask("Package scope (without @)", slug.replaceAll("-", ""));
const bundleId = await ask(
  "iOS bundle ID / Android package",
  `com.${scope}.app`,
);
const removeDemo =
  (
    await ask("Remove the realtime-todos demo feature? y/n", "n")
  ).toLowerCase() === "y";

rl?.close();

console.log("\nRewriting placeholders…");
replaceInRepo([
  ["@ken/", `@${scope}/`],
  ["ken-app-template", `${slug}-monorepo`],
  ['"ken-app"', `"${slug}"`],
  ["com.ken.app", bundleId],
  ['name: "Ken"', `name: "${displayName}"`],
  ["Ken <span", `${displayName} <span`],
  ['title: "Ken"', `title: "${displayName}"`],
]);

if (removeDemo) {
  console.log("Removing the todos demo…");
  const demoFiles = [
    "packages/backend/convex/todos.ts",
    "packages/backend/convex/todos.test.ts",
    "apps/nextjs/src/app/_components/todos.tsx",
    "apps/expo/src/components/todos.tsx",
    "apps/expo/src/stores/todo-filter.ts",
  ];
  for (const file of demoFiles) {
    fs.rmSync(path.join(root, file), { force: true });
  }

  // schema.ts: drop the todos table
  const schemaPath = path.join(root, "packages/backend/convex/schema.ts");
  fs.writeFileSync(
    schemaPath,
    `import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Clerk user ID (the JWT \`subject\` claim)
    externalId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_external_id", ["externalId"]),

  // Expo push tokens, one row per device (a user can have several devices).
  pushTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),
});
`,
  );

  // users.ts: drop the todos cleanup inside deleteFromClerk
  const usersPath = path.join(root, "packages/backend/convex/users.ts");
  let users = fs.readFileSync(usersPath, "utf8");
  users = users.replace(
    /\n    const todos = await ctx\.db[\s\S]*?todos\.map\(\(todo\) => ctx\.db\.delete\(todo\._id\)\)\);\n/,
    "\n",
  );
  fs.writeFileSync(usersPath, users);

  // Next.js page: drop the todos import and usage
  const pagePath = path.join(root, "apps/nextjs/src/app/page.tsx");
  let page = fs.readFileSync(pagePath, "utf8");
  page = page
    .replace(/\nimport { Todos } from ".\/_components\/todos";\n/, "\n")
    .replace(/\n\s*<Todos \/>/, "");
  fs.writeFileSync(pagePath, page);

  // Expo home screen: drop the todos import and usage
  const indexPath = path.join(root, "apps/expo/src/app/index.tsx");
  let index = fs.readFileSync(indexPath, "utf8");
  index = index
    .replace(/\nimport { Todos } from "~\/components\/todos";\n/, "\n")
    .replace(/\n\s*<Todos \/>/, "");
  fs.writeFileSync(indexPath, index);
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

console.log(`
Done! Next steps:
  1. cp .env.example .env  (then fill it in — see README)
  2. pnpm dev:backend      (creates your Convex project on first run)
  3. pnpm dev:next / pnpm ios
`);
