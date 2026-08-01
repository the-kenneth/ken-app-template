import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { Button, Input, Separator, Text } from "@ken/ui-mobile";

// Required for the OAuth browser flow to close correctly.
WebBrowser.maybeCompleteAuthSession();

type Mode = "signIn" | "signUp" | "verifyEmail";

/**
 * Email/password + Google/Apple sign-in, using Clerk's signals-based API
 * (@clerk/expo v3): methods return { error } instead of throwing, and
 * finalize() activates the session.
 *
 * Enable the corresponding providers in the Clerk dashboard:
 * User & Authentication → Email, Phone, Username (email + password)
 * User & Authentication → Social connections (Google, Apple)
 */
export function SignInScreen() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  // Warm up the browser on Android for a faster OAuth flow.
  useEffect(() => {
    if (Platform.OS === "android") {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    }
  }, []);

  const onSignInPress = async () => {
    setError(null);
    const { error: signInError } = await signIn.password({
      identifier: email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) setError(finalizeError.message);
    } else {
      setError("Additional verification required — check your Clerk config.");
    }
  };

  const onSignUpPress = async () => {
    setError(null);
    const { error: signUpError } = await signUp.password({
      emailAddress: email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setError(sendError.message);
      return;
    }
    setMode("verifyEmail");
  };

  const onVerifyPress = async () => {
    setError(null);
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code,
    });
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) setError(finalizeError.message);
    } else {
      setError("Verification incomplete — try again.");
    }
  };

  const onSSOPress = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      setError(null);
      try {
        const { createdSessionId, setActive } = await startSSOFlow({
          strategy,
          // Must match the `scheme` in app.config.ts.
          redirectUrl: AuthSession.makeRedirectUri(),
        });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [startSSOFlow],
  );

  if (mode === "verifyEmail") {
    return (
      <View style={styles.container}>
        <Text variant="h2">Check your email</Text>
        <Text tone="muted" style={styles.subtitle}>
          We sent a code to {email}
        </Text>
        <Input
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          keyboardType="number-pad"
          autoFocus
        />
        {error && (
          <Text variant="small" tone="destructive">
            {error}
          </Text>
        )}
        <Button size="lg" onPress={() => void onVerifyPress()}>
          Verify
        </Button>
      </View>
    );
  }

  const isSignIn = mode === "signIn";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text variant="h2">{isSignIn ? "Sign in" : "Create account"}</Text>

      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoComplete={isSignIn ? "current-password" : "new-password"}
      />
      {error && (
        <Text variant="small" tone="destructive">
          {error}
        </Text>
      )}

      <Button
        size="lg"
        onPress={() => void (isSignIn ? onSignInPress() : onSignUpPress())}
      >
        {isSignIn ? "Sign in" : "Sign up"}
      </Button>

      <View style={styles.divider}>
        <Separator style={styles.dividerLine} />
        <Text variant="small" tone="muted">
          or
        </Text>
        <Separator style={styles.dividerLine} />
      </View>

      <Button
        variant="outline"
        size="lg"
        onPress={() => void onSSOPress("oauth_google")}
      >
        Continue with Google
      </Button>
      <Button
        variant="outline"
        size="lg"
        onPress={() => void onSSOPress("oauth_apple")}
      >
        Continue with Apple
      </Button>

      <Button
        variant="link"
        style={styles.switchMode}
        onPress={() => setMode(isSignIn ? "signUp" : "signIn")}
      >
        {isSignIn ? "No account? Sign up" : "Already have an account? Sign in"}
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  subtitle: {
    marginBottom: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  // flexBasis from `flex` wins over the Separator's own `width: "100%"`, so the
  // two rules share the row either side of the label.
  dividerLine: {
    flex: 1,
  },
  switchMode: {
    marginTop: 8,
  },
});
