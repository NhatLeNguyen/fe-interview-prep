import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/types/i18n";

/** Cấu hình i18n cho UI (không liên quan nội dung câu hỏi). */
export const i18nConfig = {
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
} as const;

export type { Locale };
