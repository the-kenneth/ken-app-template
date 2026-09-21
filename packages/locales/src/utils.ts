export const SUPPORTED_LOCALES = Object.freeze({
  "en-US": { fallback: ["en"] },
  "en-GB": { fallback: ["en"] },
} as const);

export type SupportedLanguageTag = keyof typeof SUPPORTED_LOCALES;
export type ExtractRegion<Tag extends string> =
  Tag extends `${string}-${infer Region}` ? Region : never;
export type SupportedRegionCode = ExtractRegion<SupportedLanguageTag>;

export const DEFAULT_LANGUAGE_TAG: SupportedLanguageTag = "en-US";
export const DEFAULT_REGION_CODE: SupportedRegionCode = "US";

export const SUPPORTED_REGIONS = Object.freeze([
  ...new Set(
    Object.keys(SUPPORTED_LOCALES).map(
      (tag) => tag.split("-")[1] as SupportedRegionCode,
    ),
  ),
]);

export const IMPERIAL_REGIONS: ReadonlySet<SupportedRegionCode> = new Set([
  "US",
]);

export type LocalePreference = {
  languageTag?: string | null;
  regionCode?: string | null;
};

const supportedLanguageTags = Object.keys(
  SUPPORTED_LOCALES,
) as SupportedLanguageTag[];

const findSupportedLanguageTag = (
  languageTag: string,
): SupportedLanguageTag | undefined =>
  supportedLanguageTags.find(
    (supportedTag) => supportedTag.toLowerCase() === languageTag.toLowerCase(),
  );

const findSupportedRegionCode = (
  regionCode: string,
): SupportedRegionCode | undefined =>
  SUPPORTED_REGIONS.find(
    (supportedRegion) =>
      supportedRegion.toLowerCase() === regionCode.toLowerCase(),
  );

export const getSupportedLanguageTag = (
  locales: readonly LocalePreference[],
): SupportedLanguageTag => {
  const locale = locales[0];
  if (!locale) return DEFAULT_LANGUAGE_TAG;

  if (locale.languageTag) {
    const exactMatch = findSupportedLanguageTag(locale.languageTag);
    if (exactMatch) return exactMatch;
  }

  if (locale.regionCode) {
    const regionMatch = findSupportedLanguageTag(`en-${locale.regionCode}`);
    if (regionMatch) return regionMatch;
  }

  return DEFAULT_LANGUAGE_TAG;
};

export const getSupportedRegionCode = (
  locales: readonly LocalePreference[],
): SupportedRegionCode => {
  const locale = locales[0];
  if (!locale) return DEFAULT_REGION_CODE;

  if (locale.regionCode) {
    const regionMatch = findSupportedRegionCode(locale.regionCode);
    if (regionMatch) return regionMatch;
  }

  const languageTag = getSupportedLanguageTag(locales);
  return languageTag.split("-")[1] as SupportedRegionCode;
};
