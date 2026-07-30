#!/usr/bin/env node
/**
 * Rewrites `src/palette.ts` from a pasted shadcn/tweakcn theme.
 *
 *   node scripts/import-theme.ts ~/Downloads/theme.css
 *   pnpm -F @ken/tokens tokens:import ~/Downloads/theme.css
 *
 * Export "CSS Variables" from tweakcn (Tailwind v4 / oklch) and point this at
 * the file. It replaces the colour source only — run `pnpm tokens:build`
 * afterwards to regenerate theme.css and the native tokens.
 *
 * Non-colour tokens (radius, spacing, shadows) live in `src/scale.ts` and are
 * reported as a diff rather than overwritten, since they are hand-tuned.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ColorScheme, ColorToken } from "../src/contracts.ts";

import { colors } from "../src/palette.ts";
import { radiusBase } from "../src/scale.ts";

const PALETTE_OUT = path.join(import.meta.dirname, "../src/palette.ts");

const TOKENS = Object.keys(colors.light) as ColorToken[];

/** `card-foreground` → `cardForeground`, `chart-1` → `chart1`. */
const camel = (name: string): string =>
  name.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());

const declarations = (css: string): Map<string, string> => {
  const found = new Map<string, string>();
  const pattern = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(css)) !== null) {
    found.set(camel(match[1] ?? ""), (match[2] ?? "").trim());
  }
  return found;
};

/**
 * Splits the stylesheet into its dark block and everything else. Handles both
 * shapes tweakcn emits: a nested `@variant dark { }` and a top-level `.dark { }`.
 */
const split = (css: string): Record<ColorScheme, string> => {
  const start = css.search(/(?:@variant\s+dark|\.dark)\s*\{/);
  if (start === -1)
    throw new Error("No dark block found (@variant dark / .dark)");

  const open = css.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  return {
    dark: css.slice(open + 1, end),
    light: css.slice(0, start) + css.slice(end + 1),
  };
};

const collect = (css: string, scheme: ColorScheme): Record<string, string> => {
  const found = declarations(css);
  const missing: string[] = [];
  const notOklch: string[] = [];
  const result: Record<string, string> = {};

  for (const token of TOKENS) {
    const value = found.get(token);
    if (value === undefined) {
      missing.push(token);
      continue;
    }
    if (!value.startsWith("oklch(")) {
      notOklch.push(`${token}: ${value}`);
      continue;
    }
    result[token] = value;
  }

  if (missing.length > 0) {
    throw new Error(
      `${scheme}: missing ${missing.length} token(s): ${missing.join(", ")}`,
    );
  }
  if (notOklch.length > 0) {
    throw new Error(
      `${scheme}: expected oklch() values — export the Tailwind v4 theme from tweakcn.\n  ${notOklch.join("\n  ")}`,
    );
  }
  return result;
};

const render = (
  parsed: Record<ColorScheme, Record<string, string>>,
): string => {
  const block = (scheme: ColorScheme) =>
    TOKENS.map((token) => `    ${token}: "${parsed[scheme][token]}",`).join(
      "\n",
    );

  return `import type { ColorScheme, ColorToken } from "./contracts";

/**
 * The colour source of truth. Hand-edit these; \`pnpm tokens:build\` regenerates
 * both \`tooling/tailwind/theme.css\` (oklch, for web) and
 * \`src/__generated__/native.ts\` (hex, for React Native).
 *
 * Values stay in oklch because it is wider than sRGB — web renders them
 * directly and only the native build flattens to hex.
 *
 * To adopt a theme from tweakcn, export its CSS variables and run
 * \`pnpm -F @ken/tokens tokens:import <file.css>\` rather than editing by hand.
 */
export type OklchColor = \`oklch(\${string})\`;

export const colors: Record<ColorScheme, Record<ColorToken, OklchColor>> = {
  light: {
${block("light")}
  },
  dark: {
${block("dark")}
  },
};
`;
};

const source = process.argv[2];
if (!source) {
  console.error("Usage: node scripts/import-theme.ts <theme.css>");
  process.exit(1);
}

const css = await readFile(source, "utf8");
const blocks = split(css);
const parsed = {
  light: collect(blocks.light, "light"),
  dark: collect(blocks.dark, "dark"),
};

await writeFile(PALETTE_OUT, render(parsed), "utf8");

// Non-colour tokens are hand-tuned in scale.ts — surface drift, don't apply it.
const importedRadius = declarations(blocks.light).get("radius");
if (importedRadius !== undefined) {
  const px = importedRadius.endsWith("rem")
    ? Number.parseFloat(importedRadius) * 16
    : Number.parseFloat(importedRadius);
  if (px !== radiusBase) {
    console.warn(
      `! theme sets --radius: ${importedRadius} (${px}px), scale.ts has radiusBase = ${radiusBase}. Update it by hand if you want it.`,
    );
  }
}

console.log(`✓ src/palette.ts — ${TOKENS.length} tokens × 2 schemes`);
console.log("  next: pnpm tokens:build");
