import { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";

import type { Tokens } from "@ken/tokens/native";

import { Text } from "./text";
import { useTokens } from "./theme";

interface ToastEntry {
  id: number;
  message: string;
}

const SHOWN_FOR = 4000;

let nextId = 1;
let visibleToasts: ToastEntry[] = [];
const listeners = new Set<(toasts: ToastEntry[]) => void>();

function publish(toasts: ToastEntry[]) {
  visibleToasts = toasts;
  for (const listener of listeners) listener(visibleToasts);
}

function announce(message: string) {
  const toastEntry = { id: nextId++, message };
  publish([...visibleToasts, toastEntry]);
  return toastEntry.id;
}

// Mobile counterpart to the web toast facade.
export const toast = Object.assign((message: string) => announce(message), {
  error: (message: string) => announce(message),
  dismiss: (id?: number) =>
    publish(
      id === undefined ? [] : visibleToasts.filter((shown) => shown.id !== id),
    ),
});

// Mount once above the navigator so messages outlive individual screens.
export function Toaster({ bottomOffset = 0 }: { bottomOffset?: number }) {
  const tokens = useTokens();
  const styles = useMemo(() => buildStyles(tokens), [tokens]);
  const [toasts, setToasts] = useState(visibleToasts);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: bottomOffset + tokens.spacing * 4 }]}
    >
      {toasts.map((toastEntry) => (
        <Toast key={toastEntry.id} toastEntry={toastEntry} styles={styles} />
      ))}
    </View>
  );
}

function Toast({
  toastEntry,
  styles,
}: {
  toastEntry: ToastEntry;
  styles: ReturnType<typeof buildStyles>;
}) {
  const { id, message } = toastEntry;

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
    const stands = setTimeout(() => toast.dismiss(id), SHOWN_FOR);
    return () => clearTimeout(stands);
  }, [id, message]);

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={styles.toast}
    >
      <Text variant="small">{message}</Text>
    </View>
  );
}

const buildStyles = (t: Tokens) =>
  StyleSheet.create({
    host: {
      position: "absolute",
      left: t.spacing * 4,
      right: t.spacing * 4,
      alignItems: "center",
      gap: t.spacing * 2,
    },
    toast: {
      backgroundColor: t.colors.popover,
      borderColor: t.colors.border,
      borderRadius: t.radius.md,
      borderWidth: 1,
      paddingHorizontal: t.spacing * 4,
      paddingVertical: t.spacing * 3,
    },
  });
