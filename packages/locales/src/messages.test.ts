import { describe, expect, test } from "vitest";

import {
  baseMessages,
  enGBOverrides,
  enUSOverrides,
  getMessages,
  getWebMessages,
} from "./messages";

const leafPaths = (value: object, prefix = ""): string[] =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null
      ? leafPaths(child, path)
      : [path];
  });

describe("message catalogues", () => {
  test("regional catalogues inherit the complete English source", () => {
    const messages = getMessages("en-GB");

    expect(messages.shared.todos.title).toBe("Todos");
    expect(messages.mobile.auth["sign-in-title"]).toBe("Sign in");
    expect(messages.backend.push.title).toBe("It works! 🎉");
  });

  test("region overrides cannot introduce unknown message keys", () => {
    const baseKeys = new Set(leafPaths(baseMessages));
    const overrideKeys = [enUSOverrides, enGBOverrides].flatMap((messages) =>
      leafPaths(messages),
    );

    expect(overrideKeys.filter((key) => !baseKeys.has(key))).toEqual([]);
  });

  test("the web adapter exposes only shared and web messages", () => {
    expect(getWebMessages("en-US")).toEqual({
      shared: getMessages("en-US").shared,
      web: getMessages("en-US").web,
    });
  });
});
