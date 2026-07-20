import { useClerk, useUser } from "@clerk/expo";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PushTestButton } from "~/components/push-test-button";
import { SignInScreen } from "~/components/sign-in-screen";
import { Todos } from "~/components/todos";

export default function Index() {
  const { user } = useUser();
  const { signOut } = useClerk();

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
            <Text style={styles.title}>
              Hi, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
            </Text>
            <TouchableOpacity onPress={() => void signOut()}>
              <Text style={styles.signOut}>Sign out</Text>
            </TouchableOpacity>
          </View>
          <PushTestButton />
          <Todos />
        </View>
      </Authenticated>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
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
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  signOut: {
    color: "#6366F1",
    fontWeight: "600",
  },
});
