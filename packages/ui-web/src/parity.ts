import type { VariantProps } from "class-variance-authority";

import type { ButtonSize, ButtonVariant } from "@ken/tokens/contracts";

import type { buttonVariants } from "./button";

/**
 * Compile-time proof that this platform's components accept exactly the
 * variants in the shared contract — add one here or in @ken/ui-mobile without
 * the other and typecheck fails.
 *
 * Asserted from outside the components so `pnpm ui-add` output stays pristine.
 *
 * Only web needs these: @ken/ui-mobile types its props straight from the
 * contracts, whereas web infers them from cva and can drift silently. Button
 * is the only variant-bearing component today — add an assertion here when a
 * second one lands.
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
