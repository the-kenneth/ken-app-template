import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { EnsureUser } from "~/components/ensure-user";

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <EnsureUser />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor:
                    colorScheme === "dark" ? "#09090B" : "#FFFFFF",
                },
              }}
            />
            <StatusBar />
          </GestureHandlerRootView>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
