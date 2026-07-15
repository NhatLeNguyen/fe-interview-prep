import type { BadgeCriteria, UserStats } from "../types";

/** Lấy giá trị hiện tại của user theo tiêu chí badge (hàm THUẦN). */
export function statValue(stats: UserStats, criteria: BadgeCriteria): number {
  switch (criteria) {
    case "streak":
      return stats.streak;
    case "study":
      return stats.study;
    case "quiz":
      return stats.quiz;
    case "coding_solved":
      return stats.codingSolved;
    case "xp":
      return stats.xp;
    default:
      return 0;
  }
}

/** Đã đủ điều kiện nhận badge chưa (hàm THUẦN). */
export function meetsCriteria(
  stats: UserStats,
  criteria: BadgeCriteria,
  threshold: number,
): boolean {
  return statValue(stats, criteria) >= threshold;
}
