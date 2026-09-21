import type { SupportedLanguageTag } from "./utils";

import enGB from "./en-gb.json";
import enUS from "./en-us.json";
import en from "./en.json";

type MessageRecord = { [key: string]: MessageRecord | string };

const regionalMessages: Record<SupportedLanguageTag, MessageRecord> = {
  "en-US": enUS,
  "en-GB": enGB,
};

const isMessageRecord = (value: unknown): value is MessageRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeMessages = (
  base: MessageRecord,
  override: MessageRecord,
): MessageRecord =>
  Object.fromEntries(
    Object.entries(base).map(([key, value]) => {
      const overrideValue = override[key];
      return [
        key,
        isMessageRecord(value) && isMessageRecord(overrideValue)
          ? mergeMessages(value, overrideValue)
          : (overrideValue ?? value),
      ];
    }),
  );

export type Messages = typeof en;

export const baseMessages = en;
export const enUSOverrides = enUS;
export const enGBOverrides = enGB;

export const getMessages = (languageTag: SupportedLanguageTag): Messages =>
  mergeMessages(en, regionalMessages[languageTag]) as Messages;

export const getWebMessages = (languageTag: SupportedLanguageTag) => {
  const messages = getMessages(languageTag);
  return { shared: messages.shared, web: messages.web };
};

export { en as defaultMessages };
