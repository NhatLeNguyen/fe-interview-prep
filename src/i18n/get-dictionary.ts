import "server-only";

import type { Dictionary, Locale } from "@/types/i18n";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  vi: () => import("./dictionaries/vi.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

/** Lấy từ điển UI theo locale (dùng ở Server Components). */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return (dictionaries[locale] ?? dictionaries.vi)();
}
