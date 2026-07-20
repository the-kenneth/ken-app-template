import type { ErrorBoundaryProps } from "expo-router";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import * as Sentry from "@sentry/react-native";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { StoreUser } from "~/components/store-user";
import { PushRegistrar } from "~/components/push-registrar";

// Crash reporting. No-op unless EXPO_PUBLIC_SENTRY_DSN is set — enable per
// project by adding the DSN to .env (see README).
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({ dsn: sentryDsn, tracesSampleRate: 0.1 });
}

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name} — copy .env.example to .env and fill it in`,
    );
  }
  return value;
}

const convexUrl = requireEnv(
  process.env.EXPO_PUBLIC_CONVEX_URL,
  "EXPO_PUBLIC_CONVEX_URL",
);
const publishableKey = requireEnv(
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
);

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

// Catches render errors anywhere in the route tree — a "something went
// wrong" screen with retry instead of a white-screen crash in production
// builds. Caught errors bypass Sentry's global handler, so report them here
// (no-op without a DSN).
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colorScheme = useColorScheme();
  const dark = colorScheme === "dark";

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <View
      style={[
        errorStyles.container,
        { backgroundColor: dark ? "#09090B" : "#FFFFFF" },
      ]}
    >
      <Text
        style={[errorStyles.title, { color: dark ? "#FAFAFA" : "#18181B" }]}
      >
        Something went wrong
      </Text>
      <Text style={errorStyles.message}>{error.message}</Text>
      <TouchableOpacity style={errorStyles.button} onPress={() => void retry()}>
        <Text style={errorStyles.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    color: "#71717A",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StoreUser />
          <PushRegistrar />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
              },
            }}
          />
          <StatusBar />
        </GestureHandlerRootView>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default sentryDsn ? Sentry.wrap(RootLayout) : RootLayout;
