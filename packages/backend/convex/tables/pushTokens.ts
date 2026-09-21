import { defineTable } from "convex/server";
import { v } from "convex/values";

// Expo push tokens, one row per device (a user can have several devices).
export const pushTokensTable = defineTable({
  userId: v.id("users"),
  token: v.string(),
  languageTag: v.optional(v.union(v.literal("en-US"), v.literal("en-GB"))),
})
  .index("by_user", ["userId"])
  .index("by_token", ["token"]);
