/** i18n CHỈ dành cho UI strings (label/nút) — KHÔNG áp cho nội dung câu hỏi (nội dung là 1 field song ngữ). */

export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

/** Cấu trúc từ điển UI. Khóa cụ thể định nghĩa trong i18n/dictionaries/*.json. */
export type Dictionary = Record<string, string>;
