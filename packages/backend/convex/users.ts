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
 * Upsert the current user from their Clerk JWT claims. Called by the apps as
 * soon as a signed-in session exists, so the user doc is available
 * immediately after sign-up (no reload, no webhook race).
 */
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("ensureUser called without an authenticated session");
    }

    const attributes = {
      externalId: identity.subject,
      name: identity.name ?? "Anonymous",
      email: identity.email,
      imageUrl: identity.pictureUrl,
    };

    const existing = await userByExternalId(ctx, identity.subject);
    if (existing === null) {
      return await ctx.db.insert("users", attributes);
    }
    await ctx.db.patch(existing._id, attributes);
    return existing._id;
  },
});

/**
 * Called from the Clerk webhook (see http.ts) on user.created/user.updated.
 * Keeps profile edits made in Clerk in sync even while the app is closed.
 */
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  handler: async (ctx, { data }) => {
    const attributes = {
      externalId: data.id,
      name:
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        "Anonymous",
      email: data.email_addresses[0]?.email_address,
      imageUrl: data.image_url,
    };

    const existing = await userByExternalId(ctx, data.id);
    if (existing === null) {
      await ctx.db.insert("users", attributes);
    } else {
      await ctx.db.patch(existing._id, attributes);
    }
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
