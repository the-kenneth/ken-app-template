import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Clerk user ID (the JWT `subject` claim)
    externalId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_external_id", ["externalId"]),

  // Expo push tokens, one row per device (a user can have several devices).
  pushTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),

  // Demo table — remove via `pnpm init:template` or delete by hand.
  todos: defineTable({
    userId: v.id("users"),
    text: v.string(),
    completed: v.boolean(),
  }).index("by_user", ["userId"]),
});
