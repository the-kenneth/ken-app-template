import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Clerk user ID (the JWT `subject` claim). The only field Clerk truly
    // owns — everything else below is app data.
    externalId: v.string(),

    // Owned by this table. Seeded from Clerk claims when the row is first
    // created (so an OAuth sign-up starts with a real name), then edited
    // in-app. Clerk sync must never overwrite this.
    name: v.string(),

    // Read-only mirrors of Clerk, kept fresh by the webhook. Do not expose
    // these as editable fields.
    // - email: Clerk owns the login credential and its verification, so route
    //   "change my email" through Clerk.
    // - imageUrl: stays Clerk-owned until there's an in-app avatar upload;
    //   otherwise an OAuth avatar would freeze at whatever it was on sign-up.
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
