# CLAUDE.md

This file provides guidance to AI agents when working with code in this repository.

## Monorepo layout

pnpm workspaces + Turborepo. One codebase ships a web app, a mobile app, and a realtime backend. The data layer is Convex and auth is Clerk.

```
apps/nextjs/        Web app — Next.js 16 App Router, Clerk modal auth
apps/expo/          Mobile app — Expo SDK 57, expo-router, custom auth screens
packages/backend/   Convex functions: schema, tables, Clerk webhook (+ tests)
packages/tokens/    Design tokens (hand-edited) + shared cross-platform API contracts
packages/ui-web/    Web UI (shadcn-style, add via `pnpm ui-add`) — DOM only, not RN
packages/ui-mobile/ React Native UI mirroring ui-web's component API
packages/analytics/ Typed track() facade (console in dev, no-op until a provider is set)
tooling/            Shared tsconfig / tailwind presets
```

Workspace packages are referenced as `@ken/*` (e.g. `@ken/backend`, `@ken/ui-web`). Shared dependency versions live in `pnpm-workspace.yaml` under `catalog:` / `catalogs:` — reference them as `"convex": "catalog:"` in package.json rather than pinning versions per package.

## Commands

Run from the repo root unless noted. All tasks flow through Turborepo.

```bash
pnpm dev             # full stack — backend (convex dev) + web + mobile Metro, concurrently in one Turbo TUI
pnpm dev:backend     # convex dev only — MUST be running when editing backend functions (live-pushes + regenerates types)
pnpm dev:next        # web only → http://localhost:3000
pnpm ios / android   # mobile — local native build with the Expo dev client (needs Xcode / Android Studio)

pnpm test            # all tests (Vitest). Single package: pnpm -F @ken/backend test
pnpm typecheck       # tsc --noEmit across the graph
pnpm lint / lint:fix # Oxlint (type-aware)
pnpm format / format:fix  # Oxfmt (also sorts imports + Tailwind classes)
pnpm lint:ws         # sherif — validates workspace/catalog consistency
pnpm ui-add          # add a shadcn component to packages/ui-web
pnpm tokens:build    # regenerate theme.css + native tokens from packages/tokens/src
```

Run a single backend test: `pnpm -F @ken/backend exec vitest run todos.test.ts`.

Backend-specific (from `packages/backend/`): `pnpm dev` (convex dev), `pnpm deploy` (convex deploy), `pnpm dashboard`, `pnpm codegen`.

## Tooling notes

- **Lint/format is Oxc, not ESLint/Prettier.** Config is the root `.oxlintrc.json` + `.oxfmtrc.json` — there is no per-package ESLint config. The `turbo/no-undeclared-env-vars` rule still runs (real `eslint-plugin-turbo` via oxlint's `jsPlugins`): any `process.env.X` you reference **must** be declared in `turbo.json` `globalEnv`, or lint fails. This keeps env changes invalidating Turbo's cache correctly.
- Node `^24.15.0`, pnpm `^10.19.0` (see `.tool-versions`).
- **Native packages shared between `apps/expo` and `packages/ui-mobile` (`react-native`, `react-native-mmkv`, `react-native-reanimated`, `react-native-svg`, `phosphor-react-native`) live in the `native` catalog** in `pnpm-workspace.yaml` — both sides reference `catalog:native`, so a bump happens in exactly one place. Membership follows what both sides share, not whether Expo manages it: `react-native` and `react-native-svg` are Expo-managed and still belong here. Caveat: `expo install --fix` can't read `catalog:` specs (it reports `Using react-native@catalog:native instead of recommended …` and may rewrite the spec in place) — when it flags one of these, bump the catalog entry instead and restore the `catalog:native` reference if it was clobbered. Keep the catalog's Expo-managed pins matching Expo's `bundledNativeModules.json` (`react-native-svg` is `15.15.4` for SDK 57). All *other* Expo-managed packages stay concrete in `apps/expo/package.json`, where `expo install --fix` owns them. `packages/ui-mobile` keeps wide `peerDependencies` ranges the way React Native libraries do, so an app-side bump never becomes a peer conflict.
- Apps load `.env` via `dotenv -e ../../.env` (the `with-env` script). A single root `.env` feeds both apps and the backend in dev; cloud builds use `eas.json` env blocks / Vercel env instead.

## Architecture: auth + data flow

This is the core pattern that spans multiple files — read `README.md` "How auth + data flow works" for the full version.

- Both apps wrap the tree in `ClerkProvider` → `ConvexProviderWithClerk`, so every Convex call carries the Clerk JWT. Functions read the caller via `ctx.auth.getUserIdentity()`.
- Auth is wired to Convex through a Clerk JWT template named exactly `convex`; `packages/backend/convex/auth.config.ts` reads `CLERK_FRONTEND_API_URL` (set in the **Convex dashboard**, not `.env`).
- `StoreUser` (in each app) upserts a `users` row as soon as a session exists. Ownership is split: `name` belongs to the app's `users` table; `email` / `imageUrl` are read-only mirrors Clerk keeps fresh.
- `packages/backend/convex/http.ts` is the Clerk webhook — syncs out-of-band profile edits/deletions into Convex. Optional in dev.
- The todos demo (`packages/backend/convex/todos.ts` + a component per app) is the reference implementation: authed queries/mutations, ownership checks, realtime updates. On mobile, zustand holds client-only UI state.
- Push: `packages/backend/convex/push.ts` exposes `internal.push.sendToUser`; call it from any Convex function to notify a user's devices (dead Expo tokens are pruned automatically). Tokens are stored per-device in the `pushTokens` table.

## Next.js server rendering with Convex

Reference: https://docs.convex.dev/client/nextjs/app-router/server-rendering

`ConvexProviderWithClerk` only authenticates **client-side** hooks. Server Components, Server Actions, and Route Handlers use `preloadQuery` / `fetchQuery` / `fetchMutation` / `fetchAction` from `convex/nextjs`, and these have **no ambient auth** — you must pass the Clerk JWT explicitly or the call runs as anonymous (authed queries then throw or return empty).

- Get the token with `getAuthToken()` from `apps/nextjs/src/app/auth.ts`. It calls Clerk's `getToken({ template: "convex" })` — the template name matters; a bare `getToken()` produces a JWT without the audience `auth.config.ts` expects and fails with `NoAuthProvider`.
- **Preferred pattern for pages** — preload on the server, subscribe on the client. First paint has real data (no loading flash) and the component stays reactive afterwards:

  ```tsx
  // page.tsx (Server Component)
  const token = await getAuthToken();
  const preloaded = await preloadQuery(api.todos.list, {}, { token });
  return <TodoList preloaded={preloaded} />;

  // todo-list.tsx ("use client")
  export function TodoList(props: {
    preloaded: Preloaded<typeof api.todos.list>;
  }) {
    const todos = usePreloadedQuery(props.preloaded);
    // ...
  }
  ```

- Use `fetchQuery` for one-shot server reads (Server Actions, route handlers, `generateMetadata`) where reactivity isn't needed. Prefer `fetchMutation`/`fetchAction` only in Server Actions — from client components, use the `useMutation`/`useAction` hooks so the Convex client handles retries and optimistic updates.
- Server-side Convex calls are point-in-time snapshots — only `usePreloadedQuery`/`useQuery` on the client subscribe to updates.
- Calling `auth()` (inside `getAuthToken`) makes the route dynamic — that's expected; authed pages can't be statically rendered.

### Protecting routes

Route protection lives in `apps/nextjs/src/proxy.ts` (Next.js 16's name for `middleware.ts`) — it has a commented example. Match routes with `createRouteMatcher`, then pick the redirect that fits how the app signs users in:

- With a dedicated sign-in page, `await auth.protect()` redirects there.
- With modal-only auth (the template default — no `/sign-in` route), `auth.protect()` has nowhere to send users; redirect manually instead:

```ts
const isProtectedRoute = createRouteMatcher(["/todos(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});
```

Middleware handles the redirect; the page itself should still preload with the token so it renders the signed-in user's data.

## Design system (web + mobile)

There is **no universal component runtime** — no react-native-web. Each platform has its own implementation; what's shared is the tokens and the API contract.

- **`packages/tokens/src/` is hand-edited; everything else is generated.** `palette.ts` (oklch) and `scale.ts` (radius, spacing, shadows) are the source of truth. `pnpm tokens:build` emits `tooling/tailwind/theme.css` (oklch, for Tailwind) and `packages/tokens/src/__generated__/native.ts` (hex + RN shadow objects). Both outputs are committed and the generator is idempotent — never edit them by hand.
- **Adopting a tweakcn theme:** export its CSS variables (Tailwind v4 / oklch) and run `pnpm -F @ken/tokens tokens:import <file.css>`, then `pnpm tokens:build`. Never paste CSS into `theme.css` — it is generated and will be overwritten.
- **Component APIs are identical across platforms**, using shadcn's vocabulary (`variant="ghost"`, `size="sm"`), so `pnpm ui-add` output drops into `packages/ui-web` unmodified. Mobile types its props directly from `@ken/tokens/contracts`, so it cannot drift; web infers its props from cva, so drift is caught by an explicit assertion in `packages/ui-web/src/parity.ts`. **That file covers `Button` and `DropdownMenuItem`** — the two that restate a union rather than reusing it. A web component that types its props from the contract directly (as `Icon` does) is already pinned and needs no assertion; one that declares a variant or size union inline needs its own, or web-side drift goes unnoticed.
- **Only the import differs:** `@ken/ui-web/button` vs `@ken/ui-mobile/button`. A component missing from mobile is a typecheck error, not a runtime crash.
- **Mobile components read colours via `useTokens()`** and build styles in a `buildStyles(tokens)` factory memoised on the token object (which is referentially stable per scheme). Web components never need this — Tailwind resolves the same tokens through CSS variables.
- **`useThemeMode()` exists on both platforms** with the same shape (`mode`, `resolvedMode`, `setMode`, `toggleMode`), backed by `localStorage` on web and MMKV on mobile — MMKV because its synchronous reads mean the saved theme is known before first paint.
- **Not shared:** screens and layout (each app composes its own), typography (mobile's `Text` scale is deliberately mobile-only; web uses Tailwind's steps), and Toast / Field, which remain web-only.
- Mirrored components: `Text` (mobile only), `Button`, `DropdownMenu`, `Icon`, `Input`, `Label`, `Separator`, `Skeleton`.
- **Icons are Phosphor, one set for both platforms** — `@phosphor-icons/react` on web, `phosphor-react-native` on mobile, with identical icon names and an identical `weight` axis (`regular`, `fill`, …), so `<Icon as={HouseIcon} weight="fill" />` means the same thing everywhere. Pass the glyph in, don't wrap it: `Icon` owns only size and weight. Each app depends on its own Phosphor package directly, because call sites import the glyph themselves — `@ken/ui-web`/`@ken/ui-mobile` owning it is not enough to resolve it from an app. Three things to know:
  - Glyphs from `@phosphor-icons/react` read React context, so a Server Component must import them from `@phosphor-icons/react/dist/ssr` instead.
  - Both packages ship ~1500 icons from one barrel. Web is handled: `next.config.js` sets `optimizePackageImports` (Phosphor is not in Next's default list), and `@phosphor-icons/react/House` also works as a direct subpath. **Mobile must use the barrel** — Metro doesn't tree-shake, but `phosphor-react-native/src/icons/House` resolves to the package's `.tsx` source, which fails `pnpm typecheck` with an error inside the library (`skipLibCheck` doesn't apply to source files). Take the bundle cost until upstream fixes it.
  - shadcn has no `phosphor` setting for `iconLibrary`, so any icons in `pnpm ui-add` output need swapping to Phosphor by hand.

## Testing

Backend functions use [convex-test](https://docs.convex.dev/testing/convex-test) + Vitest — a mock Convex backend runs the real schema/functions in-memory, including auth identities via `t.withIdentity(...)`. Follow the patterns in `packages/backend/convex/*.test.ts` (auth gating, ownership checks, webhook cascades). The web app uses Vitest + Testing Library — see `apps/nextjs/src/app/error-pages.test.tsx`.

## Analytics

`packages/analytics` defines event names + payloads once in `AnalyticsEvents`; `track()` call sites are already placed. It logs to console in dev and no-ops until `setAnalyticsProvider()` is called at app startup. Add/rename events in the facade — never change call sites when adopting a vendor.
