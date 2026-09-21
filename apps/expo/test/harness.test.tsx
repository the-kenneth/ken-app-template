import { screen } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";

import { signIn } from "./account";

describe("the mobile test harness", () => {
  it("boots the real route tree signed out", () => {
    const app = renderRouter("src/app");

    expect(app.getPathname()).toBe("/");
    expect(screen.getAllByText("Sign in")).not.toHaveLength(0);
  });

  it("boots the same route tree with an account", () => {
    signIn();
    const app = renderRouter("src/app");

    expect(app.getPathname()).toBe("/");
    expect(screen.getByText("Hi, Ada")).toBeOnTheScreen();
  });
});
