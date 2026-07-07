import type { WebhookEvent } from "@clerk/backend";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/**
 * Clerk webhook — keeps Convex users in sync with out-of-band changes
 * (profile edits, deletions) made while the apps are closed.
 *
 * Setup (per project, optional in dev — see README "Production checklist"):
 * 1. Clerk dashboard → Webhooks → Add endpoint:
 *    https://<your-deployment>.convex.site/clerk-users-webhook
 * 2. Subscribe to user.created, user.updated, user.deleted.
 * 3. Copy the signing secret into the Convex dashboard env var
 *    CLERK_WEBHOOK_SECRET.
 */
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted":
        if (event.data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId: event.data.id,
          });
        }
        break;
      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set in the Convex dashboard");
    return null;
  }
  const payload = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };
  try {
    return new Webhook(secret).verify(payload, svixHeaders) as WebhookEvent;
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return null;
  }
}

export default http;
