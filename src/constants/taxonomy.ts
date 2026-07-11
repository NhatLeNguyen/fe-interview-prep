/**
 * Hằng số phân loại kiến thức (R3, theo docs/01 + docs/08).
 * TÁCH 3 trục độc lập: `question_type` (dạng câu) · `level` (thâm niên) · `difficulty`/`frequency` (thang 1–5).
 * Dùng `as const` + `satisfies` để chống hardcode và giữ type-safety tuyệt đối.
 */
import type { Enums } from "@/types/db";

/** Dạng câu hỏi — khớp enum `question_type` trong DB. */
export const QUESTION_TYPES = [
  "theory",
  "coding",
  "quiz",
  "system-design",
  "behavioral",
] as const satisfies readonly Enums<"question_type">[];

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  theory: "Lý thuyết",
  coding: "Coding",
  quiz: "Trắc nghiệm",
  "system-design": "System Design",
  behavioral: "Hành vi",
};

/** Cấp độ thâm niên — khớp enum `level`. */
export const LEVELS = ["junior", "mid", "senior"] as const satisfies readonly Enums<"level">[];
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
};

/** Thang độ khó & độ phổ biến (1–5) — smallint + CHECK trong DB. */
export const DIFFICULTY_SCALE = [1, 2, 3, 4, 5] as const;
export type Difficulty = (typeof DIFFICULTY_SCALE)[number];

export const FREQUENCY_SCALE = [1, 2, 3, 4, 5] as const;
export type Frequency = (typeof FREQUENCY_SCALE)[number];

/** Ngưỡng "must-know deck": câu hay gặp trong phỏng vấn (frequency >= 4). */
export const MUST_KNOW_FREQUENCY_THRESHOLD: Frequency = 4;

/** Nguồn của một lượt quiz — khớp enum `quiz_source` (R1). */
export const QUIZ_SOURCES = ["preset", "custom"] as const satisfies readonly Enums<"quiz_source">[];
export type QuizSource = (typeof QUIZ_SOURCES)[number];
