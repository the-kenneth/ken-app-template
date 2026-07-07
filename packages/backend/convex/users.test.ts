import type { UserJSON } from "@clerk/backend";

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const ada = {
  subject: "clerk_ada",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

describe("users.ensureUser", () => {
  test("creates the user from JWT claims on first call", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);

    await asAda.mutation(api.users.ensureUser, {});

    const user = await asAda.query(api.users.current, {});
    expect(user).toMatchObject({
      externalId: "clerk_ada",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
  });

  test("is idempotent and updates changed claims", async () => {
    const t = convexTest(schema, modules);
    const first = await t.withIdentity(ada).mutation(api.users.ensureUser, {});
    const second = await t
      .withIdentity({ ...ada, name: "Ada L." })
      .mutation(api.users.ensureUser, {});

    expect(second).toEqual(first);
    const user = await t.withIdentity(ada).query(api.users.current, {});
    expect(user?.name).toBe("Ada L.");
  });

  test("throws without an authenticated session", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.users.ensureUser, {})).rejects.toThrow(
      "authenticated",
    );
  });
});

describe("Clerk webhook mutations", () => {
  test("upsertFromClerk creates and updates users", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.upsertFromClerk, {
      data: clerkUser({ id: "clerk_ada", first_name: "Ada" }),
    });
    let user = await t.withIdentity(ada).query(api.users.current, {});
    expect(user?.name).toBe("Ada");

    await t.mutation(internal.users.upsertFromClerk, {
      data: clerkUser({ id: "clerk_ada", first_name: "Countess" }),
    });
    user = await t.withIdentity(ada).query(api.users.current, {});
    expect(user?.name).toBe("Countess");
  });

  test("deleteFromClerk removes the user", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    await asAda.mutation(api.users.ensureUser, {});

    await t.mutation(internal.users.deleteFromClerk, {
      clerkUserId: "clerk_ada",
    });

    expect(await asAda.query(api.users.current, {})).toBeNull();
  });
});

function clerkUser(overrides: { id: string; first_name: string }): UserJSON {
  return {
    object: "user",
    id: overrides.id,
    first_name: overrides.first_name,
    last_name: null,
    email_addresses: [],
    image_url: "https://example.com/avatar.png",
  } as unknown as UserJSON;
}
