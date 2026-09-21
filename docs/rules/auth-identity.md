---
paths:
  - "apps/expo/**"
  - "apps/nextjs/**"
  - "packages/backend/**"
---

# Auth and identity

Both apps wrap their trees in Clerk and Convex auth providers. Backend functions
identify callers with `ctx.auth.getUserIdentity()` and look up the app-owned
User through the JWT subject.

- `StoreUser` creates the Convex row as soon as a Clerk session exists.
- `name` is app-owned; `email` and `imageUrl` are Clerk-owned mirrors.
- `packages/backend/convex/http.ts` handles Clerk profile updates and deletion.
- Ownership checks belong in backend functions even when the client hides the
  corresponding control.

The Clerk JWT template must be named `convex`. Its frontend API URL lives in the
Convex deployment environment, not the app's local `.env`.
