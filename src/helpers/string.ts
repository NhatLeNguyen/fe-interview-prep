/** Hàm THUẦN xử lý chuỗi — không import React. */

const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Chuyển chuỗi (có dấu tiếng Việt) thành slug kebab-case an toàn cho URL.
 * "Cơ chế Event Loop" -> "co-che-event-loop".
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(input: string, max: number, suffix = "…"): string {
  if (input.length <= max) return input;
  return input.slice(0, Math.max(0, max - suffix.length)).trimEnd() + suffix;
}

/** Tách chuỗi theo query để highlight (trả về các đoạn + cờ match). */
export function highlightMatch(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const parts: Array<{ text: string; match: boolean }> = [];
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lowerQ, i);
    if (idx === -1) {
      parts.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) parts.push({ text: text.slice(i, idx), match: false });
    parts.push({ text: text.slice(idx, idx + q.length), match: true });
    i = idx + q.length;
  }
  return parts;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
