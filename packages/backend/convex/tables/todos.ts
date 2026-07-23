import { defineTable } from "convex/server";
import { v } from "convex/values";

// Demo table — remove via `pnpm init:template` or delete by hand.
export const todosTable = defineTable({
  userId: v.id("users"),
  text: v.string(),
  completed: v.boolean(),
}).index("by_user", ["userId"]);
