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

describe("users.storeUser", () => {
  test("creates the user from JWT claims on first call", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);

    await asAda.mutation(api.users.storeUser, {});

    const user = await asAda.query(api.users.current, {});
    expect(user).toMatchObject({
      externalId: "clerk_ada",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
  });

  test("is idempotent and never overwrites the stored profile", async () => {
    const t = convexTest(schema, modules);
    const first = await t.withIdentity(ada).mutation(api.users.storeUser, {});
    const second = await t
      .withIdentity({ ...ada, name: "Ada L." })
      .mutation(api.users.storeUser, {});

    expect(second).toEqual(first);
    // Claims are a snapshot from token-issue time; the row wins.
    const user = await t.withIdentity(ada).query(api.users.current, {});
    expect(user?.name).toBe("Ada Lovelace");
  });

  test("throws without an authenticated session", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.users.storeUser, {})).rejects.toThrow(
      "authenticated",
    );
  });
});

describe("Clerk webhook mutations", () => {
  test("upsertFromClerk seeds the whole row when it does not exist yet", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(internal.users.upsertFromClerk, {
      data: clerkUser({
        id: "clerk_ada",
        first_name: "Ada",
        email: "ada@example.com",
      }),
    });

    const user = await t.withIdentity(ada).query(api.users.current, {});
    expect(user).toMatchObject({
      externalId: "clerk_ada",
      name: "Ada",
      email: "ada@example.com",
    });
  });

  test("upsertFromClerk patches the mirrors but leaves name alone", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(ada).mutation(api.users.storeUser, {});

    await t.mutation(internal.users.upsertFromClerk, {
      data: clerkUser({
        id: "clerk_ada",
        first_name: "Countess",
        email: "ada@lovelace.dev",
      }),
    });

    const user = await t.withIdentity(ada).query(api.users.current, {});
    expect(user?.email).toBe("ada@lovelace.dev");
    expect(user?.imageUrl).toBe("https://example.com/avatar.png");
    expect(user?.name).toBe("Ada Lovelace");
  });

  test("deleteFromClerk removes the user", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    await asAda.mutation(api.users.storeUser, {});

    await t.mutation(internal.users.deleteFromClerk, {
      clerkUserId: "clerk_ada",
    });

    expect(await asAda.query(api.users.current, {})).toBeNull();
  });
});

function clerkUser(overrides: {
  id: string;
  first_name: string;
  email?: string;
}): UserJSON {
  return {
    object: "user",
    id: overrides.id,
    first_name: overrides.first_name,
    last_name: null,
    email_addresses: overrides.email
      ? [{ email_address: overrides.email }]
      : [],
    image_url: "https://example.com/avatar.png",
  } as unknown as UserJSON;
}
