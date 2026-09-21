import type { ViewProps } from "react-native";

import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import type { Tokens } from "@ken/tokens/native";

import type { TextProps } from "./text";

import { Text } from "./text";
import { useTokens } from "./theme";

const buildStyles = (t: Tokens) =>
  StyleSheet.create({
    card: {
      gap: t.spacing * 6,
      paddingVertical: t.spacing * 6,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radius.xl,
      backgroundColor: t.colors.card,
      boxShadow: t.shadows.sm,
    },
    header: { gap: t.spacing * 2, paddingHorizontal: t.spacing * 6 },
    title: { color: t.colors.cardForeground, fontWeight: "600" },
    action: { position: "absolute", top: 0, right: t.spacing * 6 },
    content: { paddingHorizontal: t.spacing * 6 },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: t.spacing * 6,
    },
  });

const useStyles = () => {
  const tokens = useTokens();
  return useMemo(() => buildStyles(tokens), [tokens]);
};

export function Card({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.card, style]} {...props} />;
}

export function CardHeader({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.header, style]} {...props} />;
}

export function CardTitle({ style, ...props }: TextProps) {
  const styles = useStyles();
  return <Text style={[styles.title, style]} {...props} />;
}

export function CardDescription({ style, ...props }: TextProps) {
  return <Text variant="small" tone="muted" style={style} {...props} />;
}

export function CardAction({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.action, style]} {...props} />;
}

export function CardContent({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.content, style]} {...props} />;
}

export function CardFooter({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.footer, style]} {...props} />;
}
