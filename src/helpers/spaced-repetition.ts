/**
 * Thuật toán ôn tập ngắt quãng SM-2 (SuperMemo 2) — hàm THUẦN, không import React, không chạm DB.
 * Dùng chung bởi feature `flashcard` (chấm thẻ) và `progress` (đếm thẻ đến hạn).
 *
 * Quyết định biến thể (docs/09 §2.3): khi `grade < 3` (người dùng "Again/Hard") thì
 * GIỮ NGUYÊN `easeFactor` (không decay mỗi lần quên) — chỉ reset interval về học lại.
 */
import { addDays } from "@/helpers/date";
import type { Enums } from "@/types/db";

export type FlashcardState = Enums<"flashcard_state">;

/** Điểm tự đánh giá khi ôn: 0..5 (0 = quên hẳn, 5 = nhớ hoàn hảo). */
export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SrsState {
  state: FlashcardState;
  easeFactor: number; // >= 1.3
  intervalDays: number;
  repetitions: number;
}

export interface SrsReviewResult extends SrsState {
  dueAt: Date;
}

export const MIN_EASE_FACTOR = 1.3;
export const INITIAL_EASE_FACTOR = 2.5;

export const NEW_CARD: SrsState = {
  state: "new",
  easeFactor: INITIAL_EASE_FACTOR,
  intervalDays: 0,
  repetitions: 0,
};

/** Ngưỡng "nhớ được" — grade >= 3 mới tính là ôn thành công. */
const PASS_GRADE = 3;

/**
 * Tính trạng thái SRS kế tiếp sau một lượt ôn.
 * @param prev  trạng thái hiện tại của thẻ
 * @param grade điểm tự đánh giá (0..5)
 * @param now   thời điểm ôn (truyền vào để hàm THUẦN & test được)
 */
export function reviewCard(prev: SrsState, grade: ReviewGrade, now: Date): SrsReviewResult {
  // Quên/khó (grade < 3): học lại từ đầu, GIỮ NGUYÊN easeFactor.
  if (grade < PASS_GRADE) {
    return {
      state: "relearning",
      easeFactor: prev.easeFactor,
      intervalDays: 1,
      repetitions: 0,
      dueAt: addDays(now, 1),
    };
  }

  const repetitions = prev.repetitions + 1;

  let intervalDays: number;
  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = 6;
  else intervalDays = Math.round(prev.intervalDays * prev.easeFactor);

  // Cập nhật easeFactor theo công thức SM-2, chặn sàn 1.3.
  const nextEase = prev.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  const easeFactor = Math.max(MIN_EASE_FACTOR, Number(nextEase.toFixed(4)));

  return {
    state: "review",
    easeFactor,
    intervalDays,
    repetitions,
    dueAt: addDays(now, intervalDays),
  };
}
