import { auth } from "@clerk/nextjs/server";

// The "convex" template stamps the JWT with the audience (app_id=convex) that
// auth.config.ts's provider requires; a bare getToken() fails with NoAuthProvider.
export async function getAuthToken() {
  return (await (await auth()).getToken({ template: "convex" })) ?? undefined;
}
