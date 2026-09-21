import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import * as Sentry from "@sentry/react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import type { Tokens } from "@ken/tokens/native";

import { Button, Input, Separator, Text, useTokens } from "@ken/ui-mobile";

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
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  const tokens = useTokens();
  const styles = useMemo(() => buildStyles(tokens), [tokens]);

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
      Sentry.captureException(signInError);
      setError(t("mobile.auth.sign-in-error"));
      return;
    }
    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        Sentry.captureException(finalizeError);
        setError(t("mobile.auth.session-error"));
      }
    } else {
      setError(t("mobile.auth.additional-verification-error"));
    }
  };

  const onSignUpPress = async () => {
    setError(null);
    const { error: signUpError } = await signUp.password({
      emailAddress: email,
      password,
    });
    if (signUpError) {
      Sentry.captureException(signUpError);
      setError(t("mobile.auth.sign-up-error"));
      return;
    }
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      Sentry.captureException(sendError);
      setError(t("mobile.auth.send-code-error"));
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
      Sentry.captureException(verifyError);
      setError(t("mobile.auth.verify-code-error"));
      return;
    }
    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        Sentry.captureException(finalizeError);
        setError(t("mobile.auth.session-error"));
      }
    } else {
      setError(t("mobile.auth.verification-incomplete-error"));
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
        Sentry.captureException(err);
        setError(t("mobile.auth.sso-error"));
      }
    },
    [startSSOFlow, t],
  );

  if (mode === "verifyEmail") {
    return (
      <View style={styles.container}>
        <Text variant="h2">{t("mobile.auth.check-email-title")}</Text>
        <Text tone="muted" style={styles.subtitle}>
          {t("mobile.auth.check-email-description", { email })}
        </Text>
        <Input
          value={code}
          onChangeText={setCode}
          placeholder={t("mobile.auth.verification-code-placeholder")}
          keyboardType="number-pad"
          autoFocus
        />
        {error && (
          <Text variant="small" tone="destructive">
            {error}
          </Text>
        )}
        <Button size="lg" onPress={() => void onVerifyPress()}>
          {t("mobile.auth.verify")}
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
      <Text variant="h2">
        {t(
          isSignIn
            ? "mobile.auth.sign-in-title"
            : "mobile.auth.create-account-title",
        )}
      </Text>

      <Input
        value={email}
        onChangeText={setEmail}
        placeholder={t("mobile.auth.email-placeholder")}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder={t("mobile.auth.password-placeholder")}
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
        {t(isSignIn ? "mobile.auth.sign-in" : "mobile.auth.sign-up")}
      </Button>

      <View style={styles.divider}>
        <Separator style={styles.dividerLine} />
        <Text variant="small" tone="muted">
          {t("mobile.auth.divider")}
        </Text>
        <Separator style={styles.dividerLine} />
      </View>

      <Button
        variant="outline"
        size="lg"
        onPress={() => void onSSOPress("oauth_google")}
      >
        {t("mobile.auth.continue-with-google")}
      </Button>
      <Button
        variant="outline"
        size="lg"
        onPress={() => void onSSOPress("oauth_apple")}
      >
        {t("mobile.auth.continue-with-apple")}
      </Button>

      <Button
        variant="link"
        style={styles.switchMode}
        onPress={() => setMode(isSignIn ? "signUp" : "signIn")}
      >
        {t(
          isSignIn
            ? "mobile.auth.switch-to-sign-up"
            : "mobile.auth.switch-to-sign-in",
        )}
      </Button>
    </KeyboardAvoidingView>
  );
}

const buildStyles = (t: Tokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: t.spacing * 6,
      gap: t.spacing * 3,
    },
    subtitle: {
      marginBottom: t.spacing * 2,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing * 2,
      marginVertical: t.spacing,
    },
    // flexBasis from `flex` wins over the Separator's own `width: "100%"`, so the
    // two rules share the row either side of the label.
    dividerLine: {
      flex: 1,
    },
    switchMode: {
      marginTop: t.spacing * 2,
    },
  });
