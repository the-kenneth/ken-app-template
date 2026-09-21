import type { LanguageDetectorModule, ParseKeys } from "i18next";

import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import {
  baseMessages,
  enGBOverrides,
  enUSOverrides,
  SUPPORTED_LOCALES,
} from "@ken/locales";

import { getUserLanguageTag } from "./utils";

const languageDetector: LanguageDetectorModule = {
  type: "languageDetector",
  detect: getUserLanguageTag,
  init: () => undefined,
  cacheUserLanguage: () => undefined,
};

const i18n = createInstance();

const fallbackLng = {
  ...Object.fromEntries(
    Object.entries(SUPPORTED_LOCALES).map(([tag, config]) => [
      tag,
      [...config.fallback],
    ]),
  ),
  default: ["en"],
};

void i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    defaultNS: "translation",
    fallbackLng,
    initImmediate: false,
    interpolation: { escapeValue: false, skipOnVariables: false },
    resources: {
      en: { translation: baseMessages },
      "en-US": { translation: enUSOverrides },
      "en-GB": { translation: enGBOverrides },
    },
    react: { useSuspense: false },
    showSupportNotice: false,
  });

export type TranslationString = ParseKeys;

export default i18n;
