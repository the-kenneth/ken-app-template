import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const sourceRoots = ["apps/expo/src", "apps/nextjs/src"];

const listTsxFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listTsxFiles(path);
    return entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")
      ? [path]
      : [];
  });

const visibleTextPatterns = [
  />\s*[A-Za-z][^<>{}\n]+\s*</g,
  /\b(?:accessibilityLabel|aria-label|placeholder|title)=["'][A-Za-z][^"']*["']/g,
];

describe("localized app UI", () => {
  test("does not introduce common hardcoded user-facing strings", () => {
    const violations = sourceRoots.flatMap((sourceRoot) =>
      listTsxFiles(join(repositoryRoot, sourceRoot)).flatMap((path) => {
        const source = readFileSync(path, "utf8");
        return visibleTextPatterns.flatMap((pattern) =>
          [...source.matchAll(pattern)].map(
            (match) => `${relative(repositoryRoot, path)}: ${match[0].trim()}`,
          ),
        );
      }),
    );

    expect(violations).toEqual([]);
  });
});
