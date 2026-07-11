/** Hàm THUẦN định dạng hiển thị — không import React. */

/** 0.847 -> "85%". */
export function formatPercent(ratio: number, digits = 0): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

/** Điểm quiz: "8/10". */
export function formatScore(correct: number, total: number): string {
  return `${correct}/${total}`;
}

/** Giây -> "mm:ss" cho đồng hồ quiz. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

/** 1500 -> "1.5k" cho số liệu dashboard. */
export function formatCompactNumber(n: number): string {
  if (Math.abs(n) < 1000) return String(n);
  const units = ["k", "M", "B"];
  let value = n;
  let unitIdx = -1;
  while (Math.abs(value) >= 1000 && unitIdx < units.length - 1) {
    value /= 1000;
    unitIdx++;
  }
  return `${value.toFixed(1).replace(/\.0$/, "")}${units[unitIdx]}`;
}
