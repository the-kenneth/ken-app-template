import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Text } from "@ken/ui-mobile/text";
import { ThemeProvider } from "@ken/ui-mobile/theme";
import { fontSize, lineHeight } from "@ken/ui-mobile/typography";

it("owns semantic text size and weight", () => {
  render(
    <ThemeProvider>
      <Text testID="heading" variant="h4" weight="bold">
        Heading
      </Text>
    </ThemeProvider>,
  );

  expect(
    StyleSheet.flatten(screen.getByTestId("heading").props.style),
  ).toMatchObject({
    fontSize: fontSize.h4,
    lineHeight: lineHeight.h4,
    fontWeight: "700",
  });
});
