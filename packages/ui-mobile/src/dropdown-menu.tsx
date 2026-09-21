import type {
  CheckboxItemProps,
  ContentProps,
  GroupProps,
  ItemProps,
  LabelProps,
  PortalProps,
  RadioGroupProps,
  RadioItemProps,
  RootProps,
  SeparatorProps,
  SubContentProps,
  SubProps,
  SubTriggerProps,
  TriggerProps,
} from "@rn-primitives/dropdown-menu";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import {
  CheckboxItem,
  Content,
  Group,
  Item,
  ItemIndicator,
  Label,
  Overlay,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} from "@rn-primitives/dropdown-menu";
import { CheckIcon } from "phosphor-react-native/src/icons/Check";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { MenuItemVariant } from "@ken/tokens/contracts";
import type { Tokens } from "@ken/tokens/native";

import { Icon } from "./icon";
import { minTouchTarget } from "./metrics";
import { renderChildren } from "./renderChildren";
import { useTokens } from "./theme";
import { fontSize } from "./typography";

/**
 * Mirrors `@ken/ui-web/dropdown-menu`. Behaviour and accessibility come from
 * rn-primitives, which is style-agnostic in the same way Radix is on web — so
 * this file only supplies tokens, exactly like its web counterpart only
 * supplies Tailwind classes.
 *
 * Requires `<PortalHost />` as the last child of the root layout, and it must
 * be inside `<ThemeProvider>`: Portal renders children at the host's position,
 * so `useTokens()` below resolves context from there, not from the call site.
 */

const buildStyles = (t: Tokens) =>
  StyleSheet.create({
    overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
    content: {
      minWidth: 128,
      padding: 4,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.popover,
      boxShadow: t.shadows.md,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      minHeight: minTouchTarget,
      borderRadius: t.radius.sm,
    },
    itemPressed: { backgroundColor: t.colors.accent },
    // Leaves room for the check/dot indicator, matching web's `pl-8`.
    inset: { paddingLeft: 32 },
    itemText: { fontSize: fontSize.small, color: t.colors.popoverForeground },
    itemTextDestructive: { color: t.colors.destructive },
    disabled: { opacity: 0.5 },
    indicator: {
      position: "absolute",
      left: 8,
      width: 14,
      alignItems: "center",
    },
    indicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.colors.popoverForeground,
    },
    label: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: fontSize.small,
      fontWeight: "500",
      color: t.colors.popoverForeground,
    },
    separator: {
      marginHorizontal: -4,
      marginVertical: 4,
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.colors.border,
    },
    shortcut: {
      marginLeft: "auto",
      fontSize: fontSize.caption,
      letterSpacing: 1,
      color: t.colors.mutedForeground,
    },
  });

const useStyles = () => {
  const tokens = useTokens();
  return useMemo(() => buildStyles(tokens), [tokens]);
};

export function DropdownMenu(props: RootProps) {
  return <Root {...props} />;
}

export function DropdownMenuTrigger(props: TriggerProps) {
  return <Trigger {...props} />;
}

export function DropdownMenuPortal(props: PortalProps) {
  return <Portal {...props} />;
}

export function DropdownMenuGroup(props: GroupProps) {
  return <Group {...props} />;
}

export function DropdownMenuContent({
  style,
  sideOffset = 4,
  ...props
}: ContentProps & { style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return (
    <Portal>
      {/* Native has no implicit dismissal layer — Overlay is the tap-catcher
          Radix provides for free on web. */}
      <Overlay style={styles.overlay}>
        <Content
          sideOffset={sideOffset}
          // Content takes a single resolved style, not the array form.
          style={StyleSheet.flatten([styles.content, style])}
          {...props}
        />
      </Overlay>
    </Portal>
  );
}

/**
 * rn-primitives' pressable parts type `children` as `ReactNode | (state) =>
 * ReactNode`. Intersecting narrows it back to plain nodes, matching the web
 * API and letting renderChildren wrap bare text.
 */
interface PressableExtras {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

interface ItemExtras extends PressableExtras {
  inset?: boolean;
  variant?: MenuItemVariant;
}

export function DropdownMenuItem({
  style,
  children,
  inset,
  variant = "default",
  disabled,
  ...props
}: ItemProps & ItemExtras) {
  const styles = useStyles();
  const textStyle: TextStyle = {
    ...styles.itemText,
    ...(variant === "destructive" ? styles.itemTextDestructive : {}),
  };

  return (
    <Item
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        inset && styles.inset,
        pressed && styles.itemPressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {renderChildren(children, textStyle)}
    </Item>
  );
}

function CheckIndicator() {
  const styles = useStyles();
  const tokens = useTokens();
  return (
    <View style={styles.indicator} pointerEvents="none">
      <ItemIndicator>
        <Icon
          as={CheckIcon}
          size="sm"
          color={tokens.colors.popoverForeground}
        />
      </ItemIndicator>
    </View>
  );
}

// A plain view, not `Icon`: web draws this dot at 8px, which is below the
// shared size scale's smallest step.
function DotIndicator() {
  const styles = useStyles();
  return (
    <View style={styles.indicator} pointerEvents="none">
      <ItemIndicator>
        <View style={styles.indicatorDot} />
      </ItemIndicator>
    </View>
  );
}

export function DropdownMenuCheckboxItem({
  style,
  children,
  disabled,
  ...props
}: CheckboxItemProps & PressableExtras) {
  const styles = useStyles();
  return (
    <CheckboxItem
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        styles.inset,
        pressed && styles.itemPressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <CheckIndicator />
      {renderChildren(children, styles.itemText)}
    </CheckboxItem>
  );
}

export function DropdownMenuRadioGroup(props: RadioGroupProps) {
  return <RadioGroup {...props} />;
}

export function DropdownMenuRadioItem({
  style,
  children,
  disabled,
  ...props
}: RadioItemProps & PressableExtras) {
  const styles = useStyles();
  return (
    <RadioItem
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        styles.inset,
        pressed && styles.itemPressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <DotIndicator />
      {renderChildren(children, styles.itemText)}
    </RadioItem>
  );
}

export function DropdownMenuLabel({
  style,
  inset,
  ...props
}: LabelProps & { inset?: boolean; style?: StyleProp<TextStyle> }) {
  const styles = useStyles();
  return (
    <Label style={[styles.label, inset && styles.inset, style]} {...props} />
  );
}

export function DropdownMenuSeparator({
  style,
  ...props
}: SeparatorProps & { style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <Separator style={[styles.separator, style]} {...props} />;
}

/** Web-only concept upstream, kept for API parity — renders trailing hint text. */
export function DropdownMenuShortcut({
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  const styles = useStyles();
  return <Text style={[styles.shortcut, style]} {...props} />;
}

export function DropdownMenuSub(props: SubProps) {
  return <Sub {...props} />;
}

export function DropdownMenuSubTrigger({
  style,
  children,
  inset,
  disabled,
  ...props
}: SubTriggerProps & PressableExtras & { inset?: boolean }) {
  const styles = useStyles();
  return (
    <SubTrigger
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        inset && styles.inset,
        pressed && styles.itemPressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {renderChildren(children, styles.itemText)}
      <Text style={styles.shortcut}>›</Text>
    </SubTrigger>
  );
}

export function DropdownMenuSubContent({
  style,
  ...props
}: SubContentProps & { style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <SubContent style={[styles.content, style]} {...props} />;
}
