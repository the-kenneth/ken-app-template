import { getRequestConfig } from "next-intl/server";

import { getWebMessages } from "@ken/locales";

export const WEB_LANGUAGE_TAG = "en-US" as const;

export default getRequestConfig(() => ({
  locale: WEB_LANGUAGE_TAG,
  messages: getWebMessages(WEB_LANGUAGE_TAG),
}));
