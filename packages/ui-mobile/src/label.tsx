import type { TextProps } from "./text";

import { Text } from "./text";

export type LabelProps = Omit<TextProps, "variant">;

/**
 * Mobile counterpart to the web Label. There is no `htmlFor` equivalent in
 * React Native, so this is styling only — pair it with `accessibilityLabel`
 * on the field itself.
 */
export function Label({ style, ...props }: LabelProps) {
  return <Text variant="small" weight="medium" style={style} {...props} />;
}
