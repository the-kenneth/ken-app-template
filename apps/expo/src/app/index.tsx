import { useClerk, useUser } from "@clerk/expo";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Tokens } from "@ken/tokens/native";

import { Button, Text, useTokens } from "@ken/ui-mobile";
import { PushTestButton } from "~/components/push-test-button";
import { SignInScreen } from "~/components/sign-in-screen";
import { Todos } from "~/components/todos";

export default function Index() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const tokens = useTokens();
  const styles = useMemo(() => buildStyles(tokens), [tokens]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthLoading>
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      </AuthLoading>

      <Unauthenticated>
        <SignInScreen />
      </Unauthenticated>

      <Authenticated>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text variant="h3">
              Hi, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
            </Text>
            <Button variant="link" size="sm" onPress={() => void signOut()}>
              Sign out
            </Button>
          </View>
          <PushTestButton />
          <Todos />
        </View>
      </Authenticated>
    </SafeAreaView>
  );
}

const buildStyles = (t: Tokens) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: t.spacing * 4,
      gap: t.spacing * 4,
    },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  });
