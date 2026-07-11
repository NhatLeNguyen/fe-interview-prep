/** Hàm THUẦN xử lý mảng — không import React. */

export function groupBy<T, K extends string | number>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      (acc[key] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return [items.slice()];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

/**
 * Trộn mảng (Fisher–Yates). Nhận `rand` (0..1) để giữ tính THUẦN & test được.
 * Ví dụ ngoài test: `shuffle(arr, Math.random)`.
 */
export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
