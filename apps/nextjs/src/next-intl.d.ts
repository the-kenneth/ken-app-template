import type { Locale as _Locale } from "next-intl";

import type { getWebMessages } from "@ken/locales";
import type { WEB_LANGUAGE_TAG } from "~/i18n/request";

declare module "next-intl" {
  interface AppConfig {
    Locale: typeof WEB_LANGUAGE_TAG;
    Messages: ReturnType<typeof getWebMessages>;
  }
}
