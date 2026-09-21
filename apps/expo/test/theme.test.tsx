import { render, screen, waitFor } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";

import { tokens } from "@ken/tokens/native";
import { DropdownMenuContent, PortalHost } from "@ken/ui-mobile/dropdown-menu";
import { ThemeProvider, useTokens } from "@ken/ui-mobile/theme";

jest.mock("@rn-primitives/dropdown-menu", () => {
  const React = require("react");
  const { View: MockView } = require("react-native");
  const { Portal } = require("@rn-primitives/portal");
  const Primitive = ({ children, ...props }: React.PropsWithChildren) =>
    React.createElement(MockView, props, children);

  return { Content: Primitive, Overlay: Primitive, Portal };
});

function TokenProbe() {
  const resolved = useTokens();
  return (
    <View
      testID="token-probe"
      style={{ backgroundColor: resolved.colors.background }}
    />
  );
}

it("pins tokens for a nested surface", () => {
  render(
    <ThemeProvider>
      <ThemeProvider scheme="dark">
        <TokenProbe />
      </ThemeProvider>
    </ThemeProvider>,
  );

  expect(
    StyleSheet.flatten(screen.getByTestId("token-probe").props.style)
      .backgroundColor,
  ).toBe(tokens.dark.colors.background);
});

it("resolves portalled menu styles at the host", async () => {
  render(
    <ThemeProvider scheme="light">
      <PortalHost />
      <ThemeProvider scheme="dark">
        <DropdownMenuContent testID="menu-content" />
      </ThemeProvider>
    </ThemeProvider>,
  );

  await waitFor(() =>
    expect(
      StyleSheet.flatten(screen.getByTestId("menu-content").props.style)
        .backgroundColor,
    ).toBe(tokens.light.colors.popover),
  );
});
