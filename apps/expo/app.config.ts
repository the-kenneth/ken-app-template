import type { ConfigContext, ExpoConfig } from "expo/config";

// All of the placeholder values below (name, slug, scheme, bundle IDs) are
// rewritten by `pnpm init:template` when you start a new project.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Acme",
  slug: "acme-app",
  scheme: "acme-app",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  // EAS Update (OTA). Run `eas init` then `eas update:configure` in
  // apps/expo — it fills in the projectId below and in extra.eas.
  // OTA updates only reach binaries built with the same `version`
  // (appVersion runtime policy): JS-only changes can ship OTA, anything
  // touching native modules needs a new store build.
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/your-eas-project-id",
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.acme.app",
    supportsTablet: true,
  },
  android: {
    package: "com.acme.app",
    // Foreground and background must share dimensions (both 432x432 here);
    // monochrome drives the Android 13+ themed-icon variant.
    adaptiveIcon: {
      foregroundImage: "./assets/icon-adaptive-foreground.png",
      backgroundImage: "./assets/icon-adaptive-background.png",
      monochromeImage: "./assets/icon-adaptive-monochrome.png",
    },
  },
  // extra: {
  //   eas: {
  //     projectId: "your-eas-project-id",
  //   },
  // },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#f0f4fb",
        image: "./assets/icon.png",
        dark: {
          backgroundColor: "#0f1317",
        },
      },
    ],
  ],
});
