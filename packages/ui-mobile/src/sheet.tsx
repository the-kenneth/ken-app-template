import type { ReactNode } from "react";

import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import type { Tokens } from "@ken/tokens/native";

import { useTokens } from "./theme";

/** A system-presented bottom sheet controlled through one open state. */
export interface SheetProps {
  open: boolean;
  onClose: () => void;
  dim?: boolean;
  children?: ReactNode;
  testID?: string;
}

const alreadyGone = () => {};

export function Sheet({
  open,
  onClose,
  dim = true,
  children,
  testID,
}: SheetProps) {
  const tokens = useTokens();
  const styles = useMemo(() => buildStyles(tokens), [tokens]);
  const sheet = useRef<TrueSheet>(null);
  const presented = useRef(false);

  useEffect(() => {
    if (open) {
      presented.current = true;
      void sheet.current?.present().catch(() => (presented.current = false));
      return;
    }
    if (!presented.current) return;
    presented.current = false;
    void sheet.current?.dismiss().catch(alreadyGone);
  }, [open]);

  // Native presentation can outlive the React tree that requested it.
  useEffect(() => {
    const node = sheet.current;
    return () => {
      if (!presented.current) return;
      presented.current = false;
      void node?.dismiss().catch(alreadyGone);
    };
  }, []);

  return (
    <TrueSheet
      ref={sheet}
      testID={testID}
      detents={["auto"]}
      dimmed={dim}
      backgroundColor={tokens.colors.card}
      cornerRadius={tokens.radius.lg}
      onDidDismiss={() => {
        presented.current = false;
        onClose();
      }}
      grabber={false}
    >
      <View style={styles.content}>{children}</View>
    </TrueSheet>
  );
}

const buildStyles = (tokens: Tokens) =>
  StyleSheet.create({
    content: { padding: tokens.spacing * 4 },
  });
