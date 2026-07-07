# App Template — Next.js + Expo + Convex + Clerk

A monorepo template for shipping a **web app, mobile app, and realtime backend** from one codebase. Based on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo), with the data layer swapped for [Convex](https://convex.dev) and auth swapped for [Clerk](https://clerk.com).

| Layer        | Tech                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Web          | Next.js 16 (App Router), Tailwind v4, shadcn-style `@ken/ui`                                      |
| Mobile       | Expo SDK 57, expo-router, Reanimated, Gesture Handler, zustand, plain `StyleSheet`                |
| Backend + DB | Convex (typed realtime queries/mutations, HTTP actions)                                           |
| Auth         | Clerk — email/password + Google + Apple, on web and native                                        |
| Tooling      | pnpm workspaces + catalogs, Turborepo, Oxlint (type-aware) + Oxfmt, TypeScript, GitHub Actions CI |
| Testing      | Vitest + convex-test (backend functions run against an in-memory Convex)                          |
| Extras       | Sentry (env-gated), Expo push notifications, typed analytics facade, fingerprint-gated OTA CI     |

```text
apps/
  nextjs/        Web app (Clerk modal auth, realtime todos demo)
  expo/          Mobile app (custom auth screens, SSO, realtime todos demo)
packages/
  backend/       Convex functions: schema, users, todos, push, Clerk webhook (+ tests)
  ui/            Shared web UI components (shadcn-style, `pnpm ui-add`)
  analytics/     Typed track() facade — plug in PostHog/Mixpanel per project
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

> **Mobile builds:** the Expo app uses a [dev client](https://docs.expo.dev/develop/development-builds/introduction/), not Expo Go. `pnpm ios` builds locally (needs Xcode; Android needs Android Studio). Alternatively build in the cloud — see the EAS section below.

## EAS: builds, updates, and credentials

[EAS](https://docs.expo.dev/eas/) is Expo's cloud service for building app binaries, distributing them, and shipping OTA updates. You can develop indefinitely with local builds (`pnpm ios`); you need EAS the moment you want cloud builds, testers, stores, or OTA.

### One-time setup (per project)

```bash
npm i -g eas-cli          # the CLI is installed globally, not per-repo
eas login                 # your expo.dev account
cd apps/expo
eas init                  # creates the EAS project, writes projectId into app.config.ts
eas update:configure      # fills in updates.url for OTA
```

### The three build profiles

`eas.json` ships three profiles, each pinned to an update channel:

| Profile       | What it is                                                                                                                | Install via                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `development` | Dev client for daily work — connects to your local Metro server                                                           | Direct install on your device           |
| `preview`     | Standalone internal build for testers (iOS profile builds a simulator binary; drop `"simulator": true` for device builds) | Internal-distribution link / TestFlight |
| `production`  | Store-ready binary                                                                                                        | `eas submit` → App Store / Play Store   |

```bash
eas build --profile development --platform ios   # or android / all
eas build --profile preview --platform all
eas build --profile production --platform all
```

### Credentials — easier than it sounds

On your **first** `eas build`, EAS offers to generate and manage signing credentials for you: iOS distribution certificate + provisioning profile (it asks for your Apple Developer login once), and the Android keystore. Accept the defaults — EAS stores them and reuses them for every future build and every machine, including CI. Inspect or add extras (e.g. the iOS push key for notifications) with `eas credentials`.

### Distributing builds

- **Internal distribution** (`preview` profile): every build gets a shareable install link on [expo.dev](https://expo.dev) — testers open it on their phone. iOS requires registering tester devices once (`eas device:create` sends them a link).
- **TestFlight / Play internal track**: build with `production` and `eas submit --latest`, then promote through the store consoles.
- Every build, its logs, and its fingerprint live in the [expo.dev dashboard](https://expo.dev) (`eas build:list` from the CLI).

### Environment values in builds

Cloud builds don't read your local `.env` — each profile in `eas.json` carries its own `env` block (Convex URL, Clerk publishable key, Sentry DSN). Fill in the production values before your first production build; the placeholders are marked.

## All configuration values

| Variable                                                                  | Where it lives                   | Where to get it                                |
| ------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------- |
| `CONVEX_DEPLOYMENT`                                                       | `.env`                           | Written by `pnpm dev:backend`                  |
| `NEXT_PUBLIC_CONVEX_URL` / `EXPO_PUBLIC_CONVEX_URL`                       | `.env` (+ `eas.json` for builds) | Convex dashboard → deployment URL              |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env` (+ `eas.json` for builds) | Clerk dashboard → API keys                     |
| `CLERK_SECRET_KEY`                                                        | `.env` / Vercel env              | Clerk dashboard → API keys                     |
| `CLERK_JWT_ISSUER_DOMAIN`                                                 | **Convex dashboard**             | Clerk dashboard → JWT template page            |
| `CLERK_WEBHOOK_SECRET`                                                    | **Convex dashboard**             | Clerk dashboard → Webhooks (see below)         |
| EAS `projectId` + `updates.url`                                           | `apps/expo/app.config.ts`        | Created by `eas init` + `eas update:configure` |

Placeholders rewritten by `pnpm init:template`: `@ken` package scope, `Ken` display name, `ken-app` slug/scheme, `com.ken.app` bundle ID.

## Production checklist

1. **Convex prod deployment** — `cd packages/backend && npx convex deploy`. Set `CLERK_JWT_ISSUER_DOMAIN` (production value) in the prod deployment's env vars.
2. **Clerk production instance** — switch your Clerk app to production, add your domain. Configure real OAuth credentials: Google Cloud Console (OAuth client) and Apple Developer (Sign in with Apple service). Clerk's dashboard walks through both. Re-create the `convex` JWT template if prompted.
3. **Clerk → Convex webhook** — Clerk dashboard → Webhooks → Add endpoint: `https://<your-prod-deployment>.convex.site/clerk-users-webhook`, subscribe to `user.created`, `user.updated`, `user.deleted`. Copy the signing secret into `CLERK_WEBHOOK_SECRET` in the Convex prod deployment. (Keeps profile edits/deletions in sync; the app works without it in dev.)
4. **Web on Vercel** — import the repo, set root directory to `apps/nextjs`, add env vars (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — production values). Update `metadataBase` in `apps/nextjs/src/app/layout.tsx`.
5. **Mobile via EAS** — one-time setup + credentials are covered in the [EAS section](#eas-builds-updates-and-credentials); for release: fill in the production env values in `eas.json`, then `eas build --profile production` and `eas submit`. Requires Apple Developer / Google Play accounts.
6. **OTA updates (EAS Update)** — after a store build is live, ship JS-only changes instantly with `cd apps/expo && eas update --channel production --message "fix: …"`. Each build profile is pinned to a channel (`development`/`preview`/`production` in `eas.json`), and the `appVersion` runtime policy means an update only reaches binaries built from the same `version` in `app.config.ts`. **Rule of thumb:** changed only JS/TS? OTA is fine. Added/upgraded anything with native code (new Expo module, reanimated bump, SDK upgrade)? Bump `version` and do a store build.
7. **CI remote caching (optional)** — set `TURBO_TEAM` / `TURBO_TOKEN` repo secrets for Vercel remote caching.

## Everyday commands

```bash
pnpm dev            # all dev tasks via turbo (backend + web)
pnpm dev:backend    # convex dev — run this whenever editing backend functions
pnpm dev:next       # web only
pnpm ios / android  # mobile
pnpm ui-add         # add a shadcn component to packages/ui
pnpm turbo gen init # scaffold a new package under packages/
pnpm test           # backend tests (Vitest + convex-test)
pnpm lint / lint:fix / format / format:fix / typecheck
```

Linting is [Oxlint](https://oxc.rs) with type-aware rules (via `oxlint-tsgolint`); formatting is [Oxfmt](https://oxc.rs) with built-in import sorting and Tailwind class sorting — no ESLint/Prettier config to maintain. `turbo/no-undeclared-env-vars` still runs (the real `eslint-plugin-turbo`, loaded through oxlint's `jsPlugins`), so any `process.env.X` you reference must be declared in `turbo.json` `globalEnv` — this keeps env changes correctly invalidating Turborepo's build cache.

## Testing

Backend functions are tested with [convex-test](https://docs.convex.dev/testing/convex-test) + Vitest — a mock Convex backend runs your real schema and functions in-memory, including auth identities (`t.withIdentity(...)`). See `packages/backend/convex/*.test.ts` for the patterns (auth gating, ownership checks, webhook cascades).

The web app has a Vitest + [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) setup for component tests — see `apps/nextjs/src/app/error-pages.test.tsx` for the pattern (render, interact, mock modules like Sentry).

Run everything with `pnpm test`; CI runs it on every PR.

## Error tracking (Sentry)

Both apps ship Sentry SDKs that **no-op until you set a DSN** — nothing to strip in dev. To enable: create one Sentry project per platform, set `NEXT_PUBLIC_SENTRY_DSN` / `EXPO_PUBLIC_SENTRY_DSN` in `.env` (and Vercel / `eas.json` for deploys). For readable production stack traces, add source-map upload as a prod step: `npx @sentry/wizard@latest -i nextjs` for web and the [Sentry Expo plugin](https://docs.sentry.io/platforms/react-native/manual-setup/expo/) (needs `SENTRY_AUTH_TOKEN` in build env) for mobile.

## Push notifications

Mobile push is wired end to end via [Expo's push service](https://docs.expo.dev/push-notifications/overview/):

- The app registers its Expo push token after sign-in (`PushRegistrar`), stored per-device in the Convex `pushTokens` table.
- `packages/backend/convex/push.ts` exposes `internal.push.sendToUser` — call it from any Convex function to notify all of a user's devices; dead tokens are pruned automatically.
- The home screen's "Send me a test notification" button proves the loop.

Requirements: a **real device** (simulators can't receive push) and an EAS `projectId` (`eas init`). Android needs no extra setup for Expo push; iOS needs your Apple push key uploaded to EAS (`eas credentials`).

## Analytics

`packages/analytics` is a typed facade: event names + payloads are defined once in `AnalyticsEvents`, and `track()` calls are already sprinkled at the interesting call sites. It logs to console in dev and no-ops in production until you plug a vendor in with `setAnalyticsProvider()` at app startup — call sites never change when you adopt PostHog/Mixpanel/Amplitude per project.

## Mobile CD (fingerprint-gated OTA)

`.github/workflows/eas-preview.yml` deploys the mobile app on every merge to `main`, **disabled by default** (set repo variable `EAS_CI_ENABLED=true` + `EXPO_TOKEN` secret to enable). It uses Expo's [fingerprint action](https://github.com/expo/expo-github-action/tree/main/continuous-deploy-fingerprint): if the native fingerprint matches the latest preview build, it publishes an OTA update to the `preview` channel; if native code changed, it starts new EAS preview builds (uses build credits). Production OTA remains a manual, deliberate command — see the production checklist.

## How auth + data flow works

- Both apps wrap the tree in `ClerkProvider` → `ConvexProviderWithClerk`, so every Convex call carries the Clerk JWT; functions read it via `ctx.auth.getUserIdentity()`.
- `EnsureUser` (both apps) upserts a `users` row the moment a session exists — instant, reload-free, race-free.
- The Clerk webhook (`packages/backend/convex/http.ts`) syncs out-of-band profile edits and deletions.
- The todos demo (`packages/backend/convex/todos.ts` + a component per app) shows the full pattern: authed queries, ownership checks, realtime updates, and zustand for client-only UI state on mobile.
