/** Hằng số cho Coding Challenge (không import React). */

/** Giới hạn độ dài code gửi lên sandbox (byte). */
export const MAX_CODE_BYTES = 50_000;

/** Cắt độ dài `got`/`error` trả về (hiển thị + hạn chế exfil ồ ạt). */
export const MAX_GOT_LEN = 2_000;

/** Cooldown giữa 2 lần chạy (ms) — tránh spam Piston. */
export const RUN_COOLDOWN_MS = 1500;

export const CODING_MESSAGES = {
  tooLong: "Code quá dài (tối đa 50KB).",
  // Generic — KHÔNG echo stderr của sandbox (tránh dùng làm kênh rò rỉ).
  runtimeError: "Code chạy lỗi (biên dịch/thực thi). Kiểm tra lại cú pháp và logic.",
  pistonError: "Không chạy được code lúc này, vui lòng thử lại sau ít giây.",
  notFound: "Không tìm thấy bài.",
} as const;
