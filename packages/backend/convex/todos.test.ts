import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const ada = { subject: "clerk_ada", name: "Ada" };
const bob = { subject: "clerk_bob", name: "Bob" };

describe("todos", () => {
  test("list returns [] when not signed in", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.todos.list, {})).toEqual([]);
  });

  test("add requires auth", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.todos.add, { text: "nope" })).rejects.toThrow(
      "Not signed in",
    );
  });

  test("add, toggle, remove round-trip", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    await asAda.mutation(api.users.ensureUser, {});

    const id = await asAda.mutation(api.todos.add, { text: "write tests" });
    let todos = await asAda.query(api.todos.list, {});
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject({ text: "write tests", completed: false });

    await asAda.mutation(api.todos.toggle, { id });
    todos = await asAda.query(api.todos.list, {});
    expect(todos[0]?.completed).toBe(true);

    await asAda.mutation(api.todos.remove, { id });
    expect(await asAda.query(api.todos.list, {})).toEqual([]);
  });

  test("users cannot see or mutate each other's todos", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    const asBob = t.withIdentity(bob);
    await asAda.mutation(api.users.ensureUser, {});
    await asBob.mutation(api.users.ensureUser, {});

    const adasTodo = await asAda.mutation(api.todos.add, { text: "secret" });

    expect(await asBob.query(api.todos.list, {})).toEqual([]);
    await expect(
      asBob.mutation(api.todos.toggle, { id: adasTodo }),
    ).rejects.toThrow("Todo not found");
    await expect(
      asBob.mutation(api.todos.remove, { id: adasTodo }),
    ).rejects.toThrow("Todo not found");
  });

  test("are cascaded when the user is deleted via the Clerk webhook", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    await asAda.mutation(api.users.ensureUser, {});
    await asAda.mutation(api.todos.add, { text: "will be cascaded" });

    await t.mutation(internal.users.deleteFromClerk, {
      clerkUserId: ada.subject,
    });

    await t.run(async (ctx) => {
      expect(await ctx.db.query("todos").collect()).toEqual([]);
    });
  });

  test("rejects empty text", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    await asAda.mutation(api.users.ensureUser, {});
    await expect(
      t.withIdentity(ada).mutation(api.todos.add, { text: "   " }),
    ).rejects.toThrow("must not be empty");
  });
});
