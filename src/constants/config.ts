/** Hằng số cấu hình hệ thống — chống magic number. */

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Độ trễ debounce cho ô search/filter (ms). */
export const DEBOUNCE_MS = 300;

/** SRS: số thẻ "mới" tối đa đưa vào ôn mỗi ngày (mặc định, có thể override theo profile). */
export const DEFAULT_DAILY_NEW_CARDS = 20;

/** Khóa lưu ở localStorage (qua zustand persist / hook). */
export const STORAGE_KEYS = {
  UI: "fe-interview:ui",
  QUIZ_SESSION: "fe-interview:quiz-session",
} as const;
