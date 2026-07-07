# App Template — Next.js + Expo + Convex + Clerk

A monorepo template for shipping a **web app, mobile app, and realtime backend** from one codebase. Based on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo), with the data layer swapped for [Convex](https://convex.dev) and auth swapped for [Clerk](https://clerk.com).

| Layer        | Tech                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Web          | Next.js 16 (App Router), Tailwind v4, shadcn-style `@acme/ui`                                     |
| Mobile       | Expo SDK 57, expo-router, Reanimated, Gesture Handler, zustand, plain `StyleSheet`                |
| Backend + DB | Convex (typed realtime queries/mutations, HTTP actions)                                           |
| Auth         | Clerk — email/password + Google + Apple, on web and native                                        |
| Tooling      | pnpm workspaces + catalogs, Turborepo, Oxlint (type-aware) + Oxfmt, TypeScript, GitHub Actions CI |

```text
apps/
  nextjs/        Web app (Clerk modal auth, realtime todos demo)
  expo/          Mobile app (custom auth screens, SSO, realtime todos demo)
packages/
  backend/       Convex functions: schema, users, todos, Clerk webhook
  ui/            Shared web UI components (shadcn-style, `pnpm ui-add`)
tooling/         Shared tsconfig / tailwind presets (lint/format: root .oxlintrc.json + .oxfmtrc.json)
```

## Start a new project

1. Click **Use this template** on GitHub (or clone this repo and delete `.git`).
2. `pnpm install`
3. `pnpm init:template` — prompts for app name, slug, package scope, and bundle ID; rewrites every placeholder; optionally deletes the todos demo; deletes itself.
4. Follow **Accounts you need** and **First run** below.

## Accounts you need

| Account                                | Used for                           | Free tier |
| -------------------------------------- | ---------------------------------- | --------- |
| [Convex](https://dashboard.convex.dev) | Database + backend functions       | Yes       |
| [Clerk](https://dashboard.clerk.com)   | Auth (create one app per project)  | Yes       |
| [Expo / EAS](https://expo.dev)         | Mobile builds, OTA updates         | Yes       |
| [Vercel](https://vercel.com)           | Web hosting (or any Next.js host)  | Yes       |
| Apple Developer / Google Play          | Store distribution (when you ship) | Paid      |

## First run (dev)

### 1. Env file

```bash
cp .env.example .env
```

### 2. Convex

```bash
pnpm dev:backend
```

First run logs you into Convex, creates a dev deployment, and writes `CONVEX_DEPLOYMENT` into `.env`. Copy the printed deployment URL into `NEXT_PUBLIC_CONVEX_URL` **and** `EXPO_PUBLIC_CONVEX_URL` in `.env`. Keep this process running — it live-pushes function changes and regenerates types.

### 3. Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com). Enable **Email/password**, **Google**, and **Apple** under _User & Authentication_. (Dev instances use Clerk's shared OAuth credentials — no Google/Apple console setup needed until production.)
2. Copy the **Publishable key** into `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, and the **Secret key** into `CLERK_SECRET_KEY` (all in `.env`).
3. Create a **JWT template** named exactly `convex` (Configure → JWT templates → New template → Convex preset).
4. In the [Convex dashboard](https://dashboard.convex.dev) → Settings → Environment Variables, set `CLERK_JWT_ISSUER_DOMAIN` to your Clerk **Frontend API URL** (e.g. `https://verb-noun-00.clerk.accounts.dev`, shown on the JWT template page).

### 4. Run the apps

```bash
pnpm dev:next   # web → http://localhost:3000
pnpm ios        # mobile → local native build with the dev client
pnpm android
```

Sign up on one platform, open the other — the todos list syncs in realtime.

> **Mobile builds:** the Expo app uses a [dev client](https://docs.expo.dev/develop/development-builds/introduction/), not Expo Go. `pnpm ios` builds locally (needs Xcode; Android needs Android Studio). Alternatively build in the cloud: `cd apps/expo && eas build --profile development`.

## All configuration values

| Variable                                                                  | Where it lives                   | Where to get it                        |
| ------------------------------------------------------------------------- | -------------------------------- | -------------------------------------- |
| `CONVEX_DEPLOYMENT`                                                       | `.env`                           | Written by `pnpm dev:backend`          |
| `NEXT_PUBLIC_CONVEX_URL` / `EXPO_PUBLIC_CONVEX_URL`                       | `.env` (+ `eas.json` for builds) | Convex dashboard → deployment URL      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env` (+ `eas.json` for builds) | Clerk dashboard → API keys             |
| `CLERK_SECRET_KEY`                                                        | `.env` / Vercel env              | Clerk dashboard → API keys             |
| `CLERK_JWT_ISSUER_DOMAIN`                                                 | **Convex dashboard**             | Clerk dashboard → JWT template page    |
| `CLERK_WEBHOOK_SECRET`                                                    | **Convex dashboard**             | Clerk dashboard → Webhooks (see below) |
| EAS `projectId` + `updates.url`                                           | `apps/expo/app.config.ts`        | Created by `eas init` + `eas update:configure` |

Placeholders rewritten by `pnpm init:template`: `@acme` package scope, `Acme` display name, `acme-app` slug/scheme, `com.acme.app` bundle ID.

## Production checklist

1. **Convex prod deployment** — `cd packages/backend && npx convex deploy`. Set `CLERK_JWT_ISSUER_DOMAIN` (production value) in the prod deployment's env vars.
2. **Clerk production instance** — switch your Clerk app to production, add your domain. Configure real OAuth credentials: Google Cloud Console (OAuth client) and Apple Developer (Sign in with Apple service). Clerk's dashboard walks through both. Re-create the `convex` JWT template if prompted.
3. **Clerk → Convex webhook** — Clerk dashboard → Webhooks → Add endpoint: `https://<your-prod-deployment>.convex.site/clerk-users-webhook`, subscribe to `user.created`, `user.updated`, `user.deleted`. Copy the signing secret into `CLERK_WEBHOOK_SECRET` in the Convex prod deployment. (Keeps profile edits/deletions in sync; the app works without it in dev.)
4. **Web on Vercel** — import the repo, set root directory to `apps/nextjs`, add env vars (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — production values). Update `metadataBase` in `apps/nextjs/src/app/layout.tsx`.
5. **Mobile via EAS** — `cd apps/expo && eas init` (writes `projectId` into `app.config.ts`) and `eas update:configure` (fills in `updates.url`), fill in the production env values in `eas.json`, then `eas build --profile production` and `eas submit`. Requires Apple Developer / Google Play accounts.
6. **OTA updates (EAS Update)** — after a store build is live, ship JS-only changes instantly with `cd apps/expo && eas update --channel production --message "fix: …"`. Each build profile is pinned to a channel (`development`/`preview`/`production` in `eas.json`), and the `appVersion` runtime policy means an update only reaches binaries built from the same `version` in `app.config.ts`. **Rule of thumb:** changed only JS/TS? OTA is fine. Added/upgraded anything with native code (new Expo module, reanimated bump, SDK upgrade)? Bump `version` and do a store build.
7. **CI remote caching (optional)** — set `TURBO_TEAM` / `TURBO_TOKEN` repo secrets for Vercel remote caching.

## Everyday commands

```bash
pnpm dev            # all dev tasks via turbo (backend + web)
pnpm dev:backend    # convex dev — run this whenever editing backend functions
pnpm dev:next       # web only
pnpm ios / android  # mobile
pnpm ui-add         # add a shadcn component to packages/ui
pnpm lint / lint:fix / format / format:fix / typecheck
```

Linting is [Oxlint](https://oxc.rs) with type-aware rules (via `oxlint-tsgolint`); formatting is [Oxfmt](https://oxc.rs) with built-in import sorting and Tailwind class sorting — no ESLint/Prettier config to maintain. `turbo/no-undeclared-env-vars` still runs (the real `eslint-plugin-turbo`, loaded through oxlint's `jsPlugins`), so any `process.env.X` you reference must be declared in `turbo.json` `globalEnv` — this keeps env changes correctly invalidating Turborepo's build cache.

## How auth + data flow works

- Both apps wrap the tree in `ClerkProvider` → `ConvexProviderWithClerk`, so every Convex call carries the Clerk JWT; functions read it via `ctx.auth.getUserIdentity()`.
- `EnsureUser` (both apps) upserts a `users` row the moment a session exists — instant, reload-free, race-free.
- The Clerk webhook (`packages/backend/convex/http.ts`) syncs out-of-band profile edits and deletions.
- The todos demo (`packages/backend/convex/todos.ts` + a component per app) shows the full pattern: authed queries, ownership checks, realtime updates, and zustand for client-only UI state on mobile.
