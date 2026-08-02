import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

import type { IconSize, IconWeight } from "@ken/tokens/contracts";

import { cn } from "@ken/ui-web";

// Tailwind sizes rather than Phosphor's `size` prop, so an icon can still be
// resized by a utility class the way `pnpm ui-add` output expects.
const sizes: Record<IconSize, string> = {
  sm: "size-4",
  default: "size-5",
  lg: "size-6",
};

export interface IconProps extends React.ComponentProps<"svg"> {
  /** Any icon from `@phosphor-icons/react`, e.g. `HouseIcon`. */
  as: PhosphorIcon;
  size?: IconSize;
  weight?: IconWeight;
}

/**
 * Renders a Phosphor glyph at the shared size scale.
 *
 * Glyphs from `@phosphor-icons/react` read `IconContext`, so they only render
 * inside a Client Component — from a Server Component, import the same name
 * from `@phosphor-icons/react/dist/ssr` instead.
 */
export function Icon({
  as: Glyph,
  size = "default",
  weight = "regular",
  className,
  ...props
}: IconProps) {
  return (
    <Glyph
      data-slot="icon"
      weight={weight}
      className={cn(sizes[size], className)}
      {...props}
    />
  );
}
