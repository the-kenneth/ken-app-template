import type { UserJSON } from "@clerk/backend";
import type { Validator } from "convex/values";

import { v } from "convex/values";

import type { QueryCtx } from "./_generated/server";

import { internalMutation, mutation, query } from "./_generated/server";

/**
 * Get the Convex user doc for the currently signed-in Clerk user, or null.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Create the current user's doc from their Clerk JWT claims. Called by the
 * apps as soon as a signed-in session exists, so the user doc is available
 * immediately after sign-up (no reload, no webhook race).
 *
 * Deliberately insert-only. The apps call this on every mount, so patching
 * here would overwrite in-app profile edits with stale JWT claims (claims are
 * a snapshot from token-issue time) on the next app open. Profile fields are
 * owned by the users table once the row exists — see schema.ts.
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("storeUser called without an authenticated session");
    }

    const existing = await userByExternalId(ctx, identity.subject);
    if (existing !== null) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      externalId: identity.subject,
      name: identity.name ?? "Anonymous",
      email: identity.email,
      imageUrl: identity.pictureUrl,
    });
  },
});

/**
 * Called from the Clerk webhook (see http.ts) on user.created/user.updated.
 *
 * On create, seeds the whole row — this covers the case where the webhook
 * lands before the app gets a chance to call `storeUser`.
 *
 * On update, patches the Clerk-owned mirrors (`email`, `imageUrl`) and leaves
 * `name` alone — that one belongs to the users table and must survive
 * out-of-band edits made in Clerk's own UI.
 */
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  handler: async (ctx, { data }) => {
    const mirrored = {
      email: data.email_addresses[0]?.email_address,
      imageUrl: data.image_url,
    };

    const existing = await userByExternalId(ctx, data.id);
    if (existing === null) {
      await ctx.db.insert("users", {
        externalId: data.id,
        name:
          [data.first_name, data.last_name].filter(Boolean).join(" ") ||
          "Anonymous",
        ...mirrored,
      });
      return;
    }

    await ctx.db.patch(existing._id, mirrored);
  },
});

/**
 * Called from the Clerk webhook on user.deleted. Removes the user and any
 * documents owned by them.
 */
export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await userByExternalId(ctx, clerkUserId);
    if (user === null) {
      console.warn(
        `No user found for Clerk ID ${clerkUserId}, skipping delete`,
      );
      return;
    }

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    await Promise.all(todos.map((todo) => ctx.db.delete(todo._id)));

    const pushTokens = await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    await Promise.all(pushTokens.map((row) => ctx.db.delete(row._id)));

    await ctx.db.delete(user._id);
  },
});

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (user === null) {
    throw new Error("Not signed in");
  }
  return user;
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();
}
