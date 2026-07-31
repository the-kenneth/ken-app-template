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
  Pressable,
  StyleSheet,
  Text as RNText,
  useColorScheme,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  PortalHost,
  resolveStoredTokens,
  ThemeProvider,
  useTokens,
} from "@ken/ui-mobile";
import { PushRegistrar } from "~/components/push-registrar";
import { StoreUser } from "~/components/store-user";

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
  // Not useTokens(): a failure in the layout itself can leave this rendering
  // outside the ThemeProvider. Still honours the saved choice — MMKV reads
  // synchronously, so the stored mode is available without the provider.
  const t = resolveStoredTokens(useColorScheme() === "dark" ? "dark" : "light");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <View
      style={[errorStyles.container, { backgroundColor: t.colors.background }]}
    >
      <RNText style={[errorStyles.title, { color: t.colors.foreground }]}>
        Something went wrong
      </RNText>
      <RNText
        style={[errorStyles.message, { color: t.colors.mutedForeground }]}
      >
        {error.message}
      </RNText>
      <Pressable
        onPress={() => void retry()}
        style={[
          errorStyles.button,
          {
            backgroundColor: t.colors.primary,
            borderRadius: t.radius.md,
          },
        ]}
      >
        <RNText
          style={[
            errorStyles.buttonText,
            { color: t.colors.primaryForeground },
          ]}
        >
          Try again
        </RNText>
      </Pressable>
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
    textAlign: "center",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

function RootNavigator() {
  const t = useTokens();
  return (
    <>
      <StoreUser />
      <PushRegistrar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.colors.background },
        }}
      />
      <StatusBar style={t.scheme === "dark" ? "light" : "dark"} />
    </>
  );
}

function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <RootNavigator />
            {/* Must sit inside ThemeProvider: rn-primitives' Portal renders
                children at the host's position, so portalled menus resolve
                context from here, not from where they are declared. */}
            <PortalHost />
          </ThemeProvider>
        </GestureHandlerRootView>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default sentryDsn ? Sentry.wrap(RootLayout) : RootLayout;
