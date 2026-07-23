import { defineSchema } from "convex/server";

import { pushTokensTable } from "./tables/pushTokens";
import { todosTable } from "./tables/todos";
import { usersTable } from "./tables/users";

// Index only — each table's fields, validators and indexes live in
// ./tables/<table>.ts.
export default defineSchema({
  users: usersTable,
  pushTokens: pushTokensTable,
  todos: todosTable,
});
