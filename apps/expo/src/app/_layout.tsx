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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  fontSize,
  PortalHost,
  resolveStoredTokens,
  ThemeProvider,
  useTokens,
} from "@ken/ui-mobile";
import { Toaster } from "@ken/ui-mobile/toast";
import { loadEnv, SENTRY_DSN } from "~/env";
import { StoreUser } from "~/features/auth/store-user";
import { PushRegistrar } from "~/features/notifications/push-registrar";

// Crash reporting. No-op unless EXPO_PUBLIC_SENTRY_DSN is set — enable per
// project by adding the DSN to .env (see README).
if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 });
}

// After Sentry.init so a misconfigured build reports rather than dying silently.
const { convexUrl, clerkPublishableKey } = loadEnv();

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
    fontSize: fontSize.h3,
    fontWeight: "700",
  },
  message: {
    fontSize: fontSize.small,
    textAlign: "center",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  buttonText: {
    fontSize: fontSize.body,
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

function AppToaster() {
  const insets = useSafeAreaInsets();
  return <Toaster bottomOffset={insets.bottom} />;
}

function RootLayout() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <RootNavigator />
            <AppToaster />
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

export default SENTRY_DSN ? Sentry.wrap(RootLayout) : RootLayout;
