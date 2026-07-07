// Push notifications via Expo's push service.
// Flow: the mobile app registers its Expo push token after sign-in
// (see apps/expo/src/components/push-registrar.tsx); `sendToUser` fans a
// message out to all of a user's devices through https://exp.host.
import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/** Called by the mobile app whenever it has a fresh Expo push token. */
export const registerToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (existing === null) {
      await ctx.db.insert("pushTokens", { userId: user._id, token });
    } else if (existing.userId !== user._id) {
      // Device changed hands (sign-out → different account signs in).
      await ctx.db.patch(existing._id, { userId: user._id });
    }
  },
});

/** Demo: send yourself a notification on every registered device. */
export const sendTestToMe = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not signed in");
    }
    const user = await ctx.runQuery(internal.push.userByExternalIdInternal, {
      externalId: identity.subject,
    });
    if (user === null) {
      throw new Error("User not found");
    }
    await ctx.runAction(internal.push.sendToUser, {
      userId: user._id,
      title: "It works! 🎉",
      body: "This came from a Convex action via Expo's push service.",
    });
  },
});

/**
 * Reusable fan-out: send a notification to all of a user's devices.
 * Internal — call it from your own functions (see sendTestToMe), never
 * exposed to clients directly.
 */
export const sendToUser = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { userId, title, body }) => {
    const tokens = await ctx.runQuery(internal.push.tokensForUser, { userId });
    if (tokens.length === 0) {
      console.log(`No push tokens registered for user ${userId}`);
      return;
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        tokens.map((t) => ({ to: t.token, title, body, sound: "default" })),
      ),
    });
    const result = (await response.json()) as {
      data?: { status: string; details?: { error?: string } }[];
    };

    // Prune tokens Expo reports as dead (app uninstalled, token rotated).
    const tickets = result.data ?? [];
    await Promise.all(
      tickets.map(async (ticket, i) => {
        const token = tokens[i];
        if (
          token &&
          ticket.status === "error" &&
          ticket.details?.error === "DeviceNotRegistered"
        ) {
          await ctx.runMutation(internal.push.removeToken, {
            token: token.token,
          });
        }
      }),
    );
  },
});

export const tokensForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const removeToken = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const row = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (row !== null) {
      await ctx.db.delete(row._id);
    }
  },
});

export const userByExternalIdInternal = internalQuery({
  args: { externalId: v.string() },
  handler: async (ctx, { externalId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .unique();
  },
});
