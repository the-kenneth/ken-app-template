import type { NativeShadow } from "@ken/tokens/contracts";

/**
 * Serialises shadow layers to the CSS string form.
 *
 * `ViewStyle.boxShadow` accepts the structured array directly, but
 * `TextStyle.boxShadow` is typed as a string — so text-bearing components
 * like TextInput need this.
 */
export const shadowToCss = (layers: readonly NativeShadow[]): string =>
  layers
    .map(
      (l) =>
        `${l.offsetX}px ${l.offsetY}px ${l.blurRadius}px ${l.spreadDistance}px ${l.color}`,
    )
    .join(", ");
