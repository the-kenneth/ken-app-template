import { describe, expect, test } from "vitest";

import {
  DEFAULT_LANGUAGE_TAG,
  DEFAULT_REGION_CODE,
  getSupportedLanguageTag,
  getSupportedRegionCode,
} from "./utils";

describe("locale normalization", () => {
  test("keeps an exact supported language tag", () => {
    const locales = [{ languageTag: "en-GB", regionCode: "GB" }];

    expect(getSupportedLanguageTag(locales)).toBe("en-GB");
    expect(getSupportedRegionCode(locales)).toBe("GB");
  });

  test("uses supported English for an unsupported language's region", () => {
    const locales = [{ languageTag: "fr-GB", regionCode: "GB" }];

    expect(getSupportedLanguageTag(locales)).toBe("en-GB");
    expect(getSupportedRegionCode(locales)).toBe("GB");
  });

  test("uses the declared defaults for an unsupported region", () => {
    const locales = [{ languageTag: "fr-FR", regionCode: "FR" }];

    expect(getSupportedLanguageTag(locales)).toBe(DEFAULT_LANGUAGE_TAG);
    expect(getSupportedRegionCode(locales)).toBe(DEFAULT_REGION_CODE);
  });

  test("uses the declared defaults when no device locale exists", () => {
    expect(getSupportedLanguageTag([])).toBe(DEFAULT_LANGUAGE_TAG);
    expect(getSupportedRegionCode([])).toBe(DEFAULT_REGION_CODE);
  });
});
