---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "apps/expo/test/**"
  - "apps/expo/jest.config.js"
  - "**/vitest.config.ts"
---

# Testing

Backend functions use `convex-test` and Vitest. Exercise the real schema and
functions with identities created through `t.withIdentity(...)`. The web app
uses Vitest and Testing Library.

Expo is the one Jest package. Its tests boot the real route tree through
`renderRouter("src/app")`; navigation remains real while Clerk, Convex, and
native modules are adapters selected in `apps/expo/jest.config.js`.

Drive account state through `apps/expo/test/account.ts`. Assert the current
route and what the user can see rather than SDK implementation details.
