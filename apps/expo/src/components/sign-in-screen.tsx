import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We sent a code to {email}</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          keyboardType="number-pad"
          autoFocus
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => void onVerifyPress()}
        >
          <Text style={styles.primaryButtonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSignIn = mode === "signIn";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>
        {isSignIn ? "Sign in" : "Create account"}
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoComplete={isSignIn ? "current-password" : "new-password"}
      />
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => void (isSignIn ? onSignInPress() : onSignUpPress())}
      >
        <Text style={styles.primaryButtonText}>
          {isSignIn ? "Sign in" : "Sign up"}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.oauthButton}
        onPress={() => void onSSOPress("oauth_google")}
      >
        <Text style={styles.oauthButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.oauthButton}
        onPress={() => void onSSOPress("oauth_apple")}
      >
        <Text style={styles.oauthButtonText}>Continue with Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(isSignIn ? "signUp" : "signIn")}>
        <Text style={styles.switchMode}>
          {isSignIn
            ? "No account? Sign up"
            : "Already have an account? Sign in"}
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#71717A",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D4D4D8",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  error: {
    color: "#DC2626",
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D4D4D8",
  },
  dividerText: {
    color: "#71717A",
  },
  oauthButton: {
    borderWidth: 1,
    borderColor: "#D4D4D8",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  switchMode: {
    textAlign: "center",
    color: "#6366F1",
    fontWeight: "600",
    marginTop: 8,
  },
});
