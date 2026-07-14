/** Hằng số cho Coding Challenge (không import React). */

/** Marker phân tách kết quả chấm khỏi stdout của user trong output Piston. */
export const RESULT_MARKER = "__CJRESULT__";

/** Giới hạn độ dài code gửi lên Piston (byte). */
export const MAX_CODE_BYTES = 50_000;

/** Cooldown giữa 2 lần chạy (ms) — tránh spam Piston public. */
export const RUN_COOLDOWN_MS = 1500;

export const CODING_MESSAGES = {
  tooLong: "Code quá dài (tối đa 50KB).",
  noResult: "Không nhận được kết quả từ trình chạy.",
  invalidResult: "Kết quả trả về không hợp lệ.",
  pistonError: "Không chạy được code lúc này, vui lòng thử lại sau ít giây.",
} as const;
