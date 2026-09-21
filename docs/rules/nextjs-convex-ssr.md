---
paths:
  - "apps/nextjs/**"
---

# Next.js server rendering with Convex

`ConvexProviderWithClerk` authenticates client hooks only. Server Components,
Server Actions, and Route Handlers must pass a Clerk JWT explicitly to Convex.

- Get the token through `apps/nextjs/src/app/auth.ts`; it requests Clerk's
  `convex` JWT template.
- Prefer `preloadQuery` on the server and `usePreloadedQuery` in the client for
  a real first paint that remains reactive.
- Use `fetchQuery` for one-shot server reads and server mutations/actions only
  from Server Actions. Client code uses Convex hooks.
- Calling Clerk `auth()` makes a route dynamic, as authenticated pages require.
- The template uses modal auth. Protect middleware routes with an explicit
  redirect unless the project adds a dedicated sign-in page.
