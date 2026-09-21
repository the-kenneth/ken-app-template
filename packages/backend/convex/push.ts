// The app registers tokens after sign-in; sendTestToUser fans messages across devices.
// See apps/expo/src/features/notifications/push-registrar.tsx.
import { v } from "convex/values";

import { DEFAULT_LANGUAGE_TAG, getMessages } from "@ken/locales";

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
  args: {
    token: v.string(),
    languageTag: v.union(v.literal("en-US"), v.literal("en-GB")),
  },
  handler: async (ctx, { token, languageTag }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (existing === null) {
      await ctx.db.insert("pushTokens", {
        userId: user._id,
        token,
        languageTag,
      });
    } else if (
      existing.userId !== user._id ||
      existing.languageTag !== languageTag
    ) {
      // A token can move to another account or region between registrations.
      await ctx.db.patch(existing._id, { userId: user._id, languageTag });
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
    await ctx.runAction(internal.push.sendTestToUser, {
      userId: user._id,
    });
  },
});

/**
 * Sends the demo notification to all of a user's devices in each device's
 * registered locale. Missing locale data is legacy and falls back to en-US.
 */
export const sendTestToUser = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const tokens = await ctx.runQuery(internal.push.tokensForUser, { userId });
    if (tokens.length === 0) {
      console.log(`No push tokens registered for user ${userId}`);
      return;
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        tokens.map((token) => {
          const messages = getMessages(
            token.languageTag ?? DEFAULT_LANGUAGE_TAG,
          );
          return {
            to: token.token,
            title: messages.backend.push.title,
            body: messages.backend.push.body,
            sound: "default",
          };
        }),
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
