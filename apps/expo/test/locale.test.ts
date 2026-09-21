import { getLocales } from "expo-localization";

import { getUserLanguageTag, getUserRegionCode } from "~/locale/utils";

jest.mock("expo-localization", () => ({ getLocales: jest.fn() }));

const mockGetLocales = getLocales as jest.MockedFunction<typeof getLocales>;

describe("the device locale adapter", () => {
  it("uses the supported English locale for the device region", () => {
    mockGetLocales.mockReturnValue([
      {
        languageTag: "fr-GB",
        languageCode: "fr",
        languageCurrencyCode: "GBP",
        languageCurrencySymbol: "£",
        languageRegionCode: "GB",
        languageScriptCode: null,
        currencyCode: "GBP",
        currencySymbol: "£",
        decimalSeparator: ".",
        digitGroupingSeparator: ",",
        measurementSystem: "metric",
        regionCode: "GB",
        temperatureUnit: "celsius",
        textDirection: "ltr",
      },
    ]);

    expect(getUserLanguageTag()).toBe("en-GB");
    expect(getUserRegionCode()).toBe("GB");
  });
});
