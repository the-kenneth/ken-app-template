import { convexTest } from "convex-test";
import { afterEach, describe, expect, test, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const ada = { subject: "clerk_ada", name: "Ada" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("push notifications", () => {
  test("stores and refreshes the locale for a device token", async () => {
    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    await asAda.mutation(api.users.storeUser, {});

    await asAda.mutation(api.push.registerToken, {
      token: "ExponentPushToken[ada]",
      languageTag: "en-GB",
    });
    await asAda.mutation(api.push.registerToken, {
      token: "ExponentPushToken[ada]",
      languageTag: "en-US",
    });

    await t.run(async (ctx) => {
      const tokens = await ctx.db.query("pushTokens").collect();
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ languageTag: "en-US" });
    });
  });

  test("localizes each device's test notification", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ data: [{ status: "ok" }, { status: "ok" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const t = convexTest(schema, modules);
    const asAda = t.withIdentity(ada);
    await asAda.mutation(api.users.storeUser, {});
    await asAda.mutation(api.push.registerToken, {
      token: "ExponentPushToken[us]",
      languageTag: "en-US",
    });
    await asAda.mutation(api.push.registerToken, {
      token: "ExponentPushToken[gb]",
      languageTag: "en-GB",
    });

    await asAda.action(api.push.sendTestToMe, {});

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(typeof request.body).toBe("string");
    const messages = JSON.parse(request.body as string) as {
      body: string;
      to: string;
    }[];
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          to: "ExponentPushToken[us]",
          body: expect.stringContaining("localized"),
        }),
        expect.objectContaining({
          to: "ExponentPushToken[gb]",
          body: expect.stringContaining("localised"),
        }),
      ]),
    );
  });
});
