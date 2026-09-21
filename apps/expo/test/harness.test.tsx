import { screen } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";

import { signIn } from "./account";

describe("the mobile test harness", () => {
  it("renders localized auth copy through the real route tree", () => {
    const app = renderRouter("src/app");

    expect(app.getPathname()).toBe("/");
    expect(screen.getAllByText("Sign in")).not.toHaveLength(0);
  });

  it("renders localized account copy through the same route tree", () => {
    signIn();
    const app = renderRouter("src/app");

    expect(app.getPathname()).toBe("/");
    expect(screen.getByText("Hi, Ada")).toBeOnTheScreen();
  });
});
