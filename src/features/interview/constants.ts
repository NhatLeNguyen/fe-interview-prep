/** Hằng số Mock Interview (không import React). */

export const INTERVIEW_ALL = "all";
export const INTERVIEW_DEFAULT_COUNT = 5;
export const INTERVIEW_MIN_COUNT = 3;
export const INTERVIEW_MAX_COUNT = 10;
export const INTERVIEW_COUNT_OPTIONS = [3, 5, 8, 10] as const;

/** Dạng câu hỏi hợp với phỏng vấn nói (loại trừ quiz trắc nghiệm & coding). */
export const INTERVIEW_TYPES = ["theory", "system-design", "behavioral"] as const;

/** Thang tự chấm 1–5. */
export const RATING_SCALE = [1, 2, 3, 4, 5] as const;
export const RATING_LABELS: Record<number, string> = {
  1: "Chưa trả lời được",
  2: "Lơ mơ",
  3: "Tạm ổn",
  4: "Tốt",
  5: "Rất tự tin",
};
