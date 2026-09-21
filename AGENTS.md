# AGENTS.md

This file provides guidance to AI agents working in this repository.

Topic detail lives in `docs/rules/`, loaded automatically by tools that support
path-scoped rules. `.claude/rules/` points to the same files so guidance has one
source of truth.

## Monorepo layout

pnpm workspaces + Turborepo. One codebase ships a web app, a mobile app, and a
realtime backend. The data layer is Convex and auth is Clerk.

```text
apps/nextjs/        Web app — Next.js 16 App Router, Clerk modal auth
apps/expo/          Mobile app — Expo SDK 57, expo-router, custom auth screens
packages/backend/   Convex functions: schema, tables, Clerk webhook (+ tests)
packages/tokens/    Design tokens + shared cross-platform interface contracts
packages/ui-web/    Web UI (shadcn-style, add via `pnpm ui-add`)
packages/ui-mobile/ React Native UI mirroring ui-web's component interfaces
packages/analytics/ Typed track() facade
tooling/            Shared TypeScript, Tailwind, and GitHub configuration
```

Workspace packages use the `@ken/*` scope. Shared dependency versions live in
`pnpm-workspace.yaml`; use `catalog:` or `catalog:native` instead of pinning the
same dependency in several packages.

### Inside `apps/expo/src`

`app/` contains routes only. Every feature owns one folder under `features/`;
its logic sits at the feature root and its views sit under `components/`.

Do not add root-level `components/`, `hooks/`, `services/`, `providers/`, or
`stores/` buckets. A utility stays with its only caller's feature and reaches
the source root only when multiple features own it. Import through the `~/`
alias.

## Commands

Run commands from the repository root; tasks flow through Turborepo.

```bash
pnpm dev                 # backend + web + mobile Metro
pnpm dev:backend         # Convex live push and generated types
pnpm dev:next            # web only
pnpm ios / android       # local native dev-client build
pnpm test                # all package tests
pnpm typecheck           # TypeScript across the graph
pnpm lint / lint:fix     # type-aware Oxlint
pnpm format / format:fix # Oxfmt, including Markdown
pnpm lint:ws             # workspace/catalog consistency
pnpm tokens:build        # regenerate web and native token outputs
pnpm ui-add <name>       # add a shadcn component to ui-web
```

The Expo package uses Jest; every other package uses Vitest. Run a single
backend test with `pnpm -F @ken/backend exec vitest run todos.test.ts`.

## Cross-cutting invariants

- Lint and format are Oxc, not ESLint and Prettier. Any `process.env.X` must
  appear in `turbo.json` `globalEnv` so Turbo invalidates its cache correctly.
- Generated files are committed and never hand-edited:
  `tooling/tailwind/theme.css`, `packages/tokens/src/__generated__/native.ts`,
  and `packages/backend/convex/_generated/`.
- Apps load the root `.env` through `dotenv -e ../../.env`; cloud builds use
  their platform environment configuration.
- App-owned device values use `createStore` from
  `apps/expo/src/device-storage.ts`; features never open MMKV directly.
- Node and pnpm versions are fixed in `.tool-versions` and `package.json`.

Auth, server rendering, native dependencies, icons, testing, and design-system
details live in the matching file under `docs/rules/`.

## Code comments

- Keep comments to one or two lines and state the single load-bearing reason.
- Describe the code as it stands; do not narrate a change or restate the code.
- Reserve `/** */` for exported interfaces. Internal helpers use `//` or none.

Use an ADR under `docs/adr/` when the argument, alternatives, and consequences
matter. Code may cite the ADR but should not duplicate it.

## Design system

Reach for `packages/ui-web` or `packages/ui-mobile` before writing a raw web
button, React Native Pressable, or token-styled surface. Colours, radii, and
spacing come from `@ken/tokens`; do not hardcode hex values.

Only the import path differs for mirrored interfaces:
`@ken/ui-web/button` versus `@ken/ui-mobile/button`.

| Interface | Web | Mobile |
| --- | --- | --- |
| button, card, dropdown-menu, icon, input, label, separator, skeleton, theme, toast | yes | yes |
| text, touchable | no | yes |
| field | yes | no |

Import from package subpaths. `pnpm ui-add <name>` adds a web component; mirror
its public prop names into ui-mobile when the interface belongs on both.

## Analytics

`packages/analytics` defines event names and payloads once. Add events to
`AnalyticsEvents`; call sites stay unchanged when a vendor adapter is added.

## Commits and pull requests

Use Conventional Commit titles with an area-oriented scope where useful, for
example `feat(ui-mobile): controls share one interaction layer`. Descriptions
state the change against the base branch, not the history of drafts inside it.
