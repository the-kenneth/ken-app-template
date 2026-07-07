// Demo feature: a realtime, per-user todo list shared by web and mobile.
// Remove via `pnpm init:template` or delete this file plus the `todos` table
// in schema.ts and the demo UI in both apps.
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrThrow } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      return [];
    }
    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      throw new Error("Todo text must not be empty");
    }
    return await ctx.db.insert("todos", {
      userId: user._id,
      text: trimmed,
      completed: false,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const todo = await ctx.db.get(id);
    if (todo?.userId !== user._id) {
      throw new Error("Todo not found");
    }
    await ctx.db.patch(id, { completed: !todo.completed });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const todo = await ctx.db.get(id);
    if (todo?.userId !== user._id) {
      throw new Error("Todo not found");
    }
    await ctx.db.delete(id);
  },
});
