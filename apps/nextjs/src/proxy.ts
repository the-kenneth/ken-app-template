import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 uses `proxy.ts` (formerly `middleware.ts`).
// All routes are public by default; opt routes into protection as your app
// grows, e.g.:
// https://clerk.com/docs/references/nextjs/clerk-middleware
//
//   const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
//
//   export default clerkMiddleware(async (auth, req) => {
//     if (!isProtectedRoute(req)) return;
//     // With a dedicated sign-in page, this redirects there:
//     await auth.protect();
//     // With modal-only auth (no /sign-in route), redirect manually instead:
//     // const { userId } = await auth();
//     // if (!userId) return NextResponse.redirect(new URL("/", req.url));
//   });
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api)(.*)",
  ],
};
