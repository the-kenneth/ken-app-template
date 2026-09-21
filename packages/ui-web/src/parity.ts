import type { VariantProps } from "class-variance-authority";

import type {
  ButtonSize,
  ButtonVariant,
  IconSize,
  IconWeight,
  MenuItemVariant,
} from "@ken/tokens/contracts";

import type { buttonVariants } from "./button";
import type { DropdownMenuItem } from "./dropdown-menu";
import type { Icon } from "./icon";

/**
 * Compile-time proof that this platform's components accept exactly the
 * variants in the shared contract — add one here or in @ken/ui-mobile without
 * the other and typecheck fails.
 *
 * Asserted from outside the components so `pnpm ui-add` output stays pristine.
 *
 * Only web needs these: mobile types its props from the contract and cannot
 * drift. Assert from the public prop type so later implementation changes do
 * not silently weaken the cross-platform interface.
 */

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

type WebButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
type WebButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export type ButtonVariantParity = Assert<
  Exact<WebButtonVariant, ButtonVariant>
>;
export type ButtonSizeParity = Assert<Exact<WebButtonSize, ButtonSize>>;

type WebMenuItemVariant = NonNullable<
  Parameters<typeof DropdownMenuItem>[0]["variant"]
>;

export type MenuItemVariantParity = Assert<
  Exact<WebMenuItemVariant, MenuItemVariant>
>;

type WebIconSize = NonNullable<Parameters<typeof Icon>[0]["size"]>;
type WebIconWeight = NonNullable<Parameters<typeof Icon>[0]["weight"]>;

export type IconSizeParity = Assert<Exact<WebIconSize, IconSize>>;
export type IconWeightParity = Assert<Exact<WebIconWeight, IconWeight>>;
