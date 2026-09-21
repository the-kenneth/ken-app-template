import type { InitOptions as _InitOptions } from "i18next";

import type { baseMessages } from "@ken/locales/messages";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof baseMessages };
  }
}
