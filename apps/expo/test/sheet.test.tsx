import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { act, render } from "@testing-library/react-native";

import { Sheet } from "@ken/ui-mobile/sheet";
import { Text } from "@ken/ui-mobile/text";
import { ThemeProvider } from "@ken/ui-mobile/theme";

function TestSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ThemeProvider>
      <Sheet open={open} onClose={onClose}>
        <Text>Sheet content</Text>
      </Sheet>
    </ThemeProvider>
  );
}

it("presents and dismisses from controlled state", () => {
  const onClose = jest.fn();
  const view = render(<TestSheet open onClose={onClose} />);
  const nativeSheet = view.UNSAFE_getByType(TrueSheet);

  expect(nativeSheet.instance.present).toHaveBeenCalledTimes(1);

  view.rerender(<TestSheet open={false} onClose={onClose} />);
  expect(nativeSheet.instance.dismiss).toHaveBeenCalledTimes(1);

  act(() => {
    nativeSheet.props.onDidDismiss();
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("dismisses a presented sheet when its owner unmounts", () => {
  const view = render(<TestSheet open onClose={jest.fn()} />);
  const nativeSheet = view.UNSAFE_getByType(TrueSheet);
  const instance = nativeSheet.instance;

  view.unmount();

  expect(instance.dismiss).toHaveBeenCalledTimes(1);
});
