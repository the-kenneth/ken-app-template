import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const sourceRoots = [
  "apps/expo/src",
  "apps/nextjs/src",
  "packages/ui-mobile/src",
  "packages/ui-web/src",
];

const listTsxFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listTsxFiles(path);
    return entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")
      ? [path]
      : [];
  });

const visibleTextPatterns = [
  />\s*[A-Za-z][A-Za-z0-9 .,?!'’:+–—-]*\s*</g,
  />\s*\{\s*["'][A-Za-z][^"']*["']\s*\}\s*</g,
  /\b(?:accessibilityLabel|aria-label|placeholder|title)=["'][A-Za-z][^"']*["']/g,
];

const violations = sourceRoots.flatMap((sourceRoot) =>
  listTsxFiles(sourceRoot).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    return visibleTextPatterns.flatMap((pattern) =>
      [...source.matchAll(pattern)].map(
        (match) => `${relative(".", path)}: ${match[0].trim()}`,
      ),
    );
  }),
);

const appConfig = readFileSync("apps/expo/app.config.ts", "utf8");
if (/\bname:\s*["'][A-Za-z][^"']*["']/.test(appConfig)) {
  violations.push("apps/expo/app.config.ts: hardcoded app name");
}

const pushSource = readFileSync("packages/backend/convex/push.ts", "utf8");
for (const match of pushSource.matchAll(
  /\b(?:title|body):\s*["'][A-Z][^"']*["']/g,
)) {
  violations.push(`packages/backend/convex/push.ts: ${match[0]}`);
}

if (violations.length > 0) {
  console.error(
    "Hardcoded user-facing strings found:\n" + violations.join("\n"),
  );
  process.exitCode = 1;
}
