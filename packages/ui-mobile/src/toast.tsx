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
const listeners = new Set<(entries: ToastEntry[]) => void>();

function publish(entries: ToastEntry[]) {
  visibleToasts = entries;
  for (const listener of listeners) listener(visibleToasts);
}

function announce(message: string) {
  const entry = { id: nextId++, message };
  publish([...visibleToasts, entry]);
  return entry.id;
}

// Mobile counterpart to the web toast facade.
export const toast = Object.assign((message: string) => announce(message), {
  error: (message: string) => announce(message),
  dismiss: (id?: number) =>
    publish(
      id === undefined ? [] : visibleToasts.filter((entry) => entry.id !== id),
    ),
});

// Mount once above the navigator so messages outlive individual screens.
export function Toaster({ bottomOffset = 0 }: { bottomOffset?: number }) {
  const tokens = useTokens();
  const styles = useMemo(() => buildStyles(tokens), [tokens]);
  const [entries, setEntries] = useState(visibleToasts);

  useEffect(() => {
    listeners.add(setEntries);
    return () => {
      listeners.delete(setEntries);
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: bottomOffset + tokens.spacing * 4 }]}
    >
      {entries.map((entry) => (
        <Toast key={entry.id} entry={entry} styles={styles} />
      ))}
    </View>
  );
}

function Toast({
  entry,
  styles,
}: {
  entry: ToastEntry;
  styles: ReturnType<typeof buildStyles>;
}) {
  const { id, message } = entry;

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
