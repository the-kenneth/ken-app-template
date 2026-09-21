// Locale support and extension steps are centralized in @ken/locales and docs/rules/i18n.md.
import { getLocales } from "expo-localization";

import {
  DEFAULT_LANGUAGE_TAG,
  DEFAULT_REGION_CODE,
  getSupportedLanguageTag,
  getSupportedRegionCode,
  IMPERIAL_REGIONS,
  SUPPORTED_LOCALES,
  SUPPORTED_REGIONS,
} from "@ken/locales";

export {
  DEFAULT_LANGUAGE_TAG,
  DEFAULT_REGION_CODE,
  IMPERIAL_REGIONS,
  SUPPORTED_LOCALES,
  SUPPORTED_REGIONS,
};
export type {
  ExtractRegion,
  SupportedLanguageTag,
  SupportedRegionCode,
} from "@ken/locales";

export const getUserLanguageTag = () => getSupportedLanguageTag(getLocales());

export const getUserRegionCode = () => getSupportedRegionCode(getLocales());
