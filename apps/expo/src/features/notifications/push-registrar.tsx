import { useConvexAuth, useMutation } from "convex/react";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { api } from "@ken/backend/convex/_generated/api";
import { APP_LANGUAGE_TAG } from "~/locale/i18n";

// How incoming notifications behave while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

/**
 * Registers this device's Expo push token with Convex once signed in.
 *
 * Silently does nothing when it can't register:
 * - simulators/emulators (no push support)
 * - permission denied
 * - no EAS projectId yet (run `eas init` — see README)
 */
export function PushRegistrar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useConvexAuth();
  const registerToken = useMutation(api.push.registerToken);

  useEffect(() => {
    if (!isAuthenticated) return;

    const register = async () => {
      if (!Device.isDevice) return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: t("mobile.push.default-channel"),
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      let { granted } = await Notifications.getPermissionsAsync();
      if (!granted) {
        granted = (await Notifications.requestPermissionsAsync()).granted;
      }
      if (!granted) return;

      const projectId: unknown =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;
      if (typeof projectId !== "string") {
        console.log("Push: no EAS projectId configured yet, skipping");
        return;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      await registerToken({ languageTag: APP_LANGUAGE_TAG, token });
    };

    register().catch((error: unknown) => {
      console.warn("Push registration failed", error);
    });
  }, [isAuthenticated, registerToken, t]);

  return null;
}
