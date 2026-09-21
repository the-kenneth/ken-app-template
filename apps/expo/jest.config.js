const preset = require("jest-expo/ios/jest-preset");

// @rn-primitives publishes untranspiled JSX, and jest-expo's allowlist does
// not name it. Widen the preset's patterns so upstream additions carry through.
const transformIgnorePatterns = preset.transformIgnorePatterns.map((pattern) =>
  pattern.replace("(?!(", "(?!(@rn-primitives|"),
);

// expo-router's route renderer and Expo's native mocks are Jest-shaped.
// Every other workspace package uses Vitest.
module.exports = {
  preset: "jest-expo/ios",
  transformIgnorePatterns,
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: {
    "^convex/react$": "<rootDir>/test/mocks/convex.tsx",
    "^convex/react-clerk$": "<rootDir>/test/mocks/convex.tsx",
    "^@clerk/expo$": "<rootDir>/test/mocks/clerk.tsx",
    "^@clerk/expo/token-cache$": "<rootDir>/test/mocks/token-cache.ts",
    "^expo-notifications$": "<rootDir>/test/mocks/notifications.ts",
    "^react-native-mmkv$": "<rootDir>/test/mocks/mmkv.ts",
    "^react-native-reanimated$": "<rootDir>/test/mocks/reanimated.tsx",
    "^react-native-reanimated/mock$":
      "<rootDir>/test/mocks/reanimated-fake.tsx",
    "^@sentry/react-native$": "<rootDir>/test/mocks/sentry.ts",
    "^~/(.*)$": "<rootDir>/src/$1",
  },
};
