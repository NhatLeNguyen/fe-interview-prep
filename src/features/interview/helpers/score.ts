/**
 * Quy đổi các mức tự chấm (1–5) -> điểm % (hàm THUẦN — không import React).
 * Bỏ qua giá trị không hợp lệ. Không có mức nào hợp lệ -> 0.
 */
export function selfScore(ratings: (number | null | undefined)[]): number {
  const valid = ratings.filter(
    (r): r is number => typeof r === "number" && Number.isFinite(r) && r >= 1 && r <= 5,
  );
  if (valid.length === 0) return 0;
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  return Math.round((avg / 5) * 10000) / 100; // % với 2 chữ số thập phân
}
