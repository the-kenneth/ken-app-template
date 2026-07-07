import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 uses `proxy.ts` (formerly `middleware.ts`).
// All routes are public by default; opt routes into protection with
// `createRouteMatcher` + `auth.protect()` as your app grows.
// https://clerk.com/docs/references/nextjs/clerk-middleware
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api)(.*)",
  ],
};
