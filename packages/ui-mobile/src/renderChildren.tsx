import type { ReactNode } from "react";
import type { TextStyle } from "react-native";

import { Children, Fragment } from "react";
import { Text } from "react-native";

const isPrimitive = (child: ReactNode): child is string | number =>
  typeof child === "string" || typeof child === "number";

/**
 * Wraps bare text in `<Text>`, which React Native requires and the DOM does
 * not — without this, `<Button>Add {n} items</Button>` renders fine on web and
 * throws at runtime on native.
 *
 * Consecutive primitives are grouped into a single `<Text>` so interpolated
 * strings read as one run, while element children (icons) stay siblings of it
 * and keep the container's `gap` spacing.
 */
export const renderChildren = (
  children: ReactNode,
  style: TextStyle,
): ReactNode => {
  const childNodes = Children.toArray(children);
  if (!childNodes.some(isPrimitive)) return children;

  const output: ReactNode[] = [];
  let run: (string | number)[] = [];

  const flush = () => {
    if (run.length === 0) return;
    output.push(
      <Text key={`text-${output.length}`} style={style}>
        {run}
      </Text>,
    );
    run = [];
  };

  for (const child of childNodes) {
    if (isPrimitive(child)) {
      run.push(child);
      continue;
    }
    flush();
    output.push(<Fragment key={`node-${output.length}`}>{child}</Fragment>);
  }
  flush();

  return output;
};
