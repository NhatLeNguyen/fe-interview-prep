import type { Enums, Tables } from "@/types/db";

export type QuizLevel = Enums<"level">;

export interface QuizOption {
  key: string;
  text: string;
  explanation?: string | null;
}

/** Option khi ĐANG làm bài — CHỈ key + text (KHÔNG kèm explanation để tránh lộ đáp án). */
export interface RunnerOption {
  key: string;
  text: string;
}

/** Câu hỏi khi ĐANG làm bài — KHÔNG kèm correct_keys / explanation (tránh lộ đáp án ở client). */
export interface RunnerQuestion {
  id: string;
  prompt_md: string;
  code_snippet: string | null;
  code_language: string | null;
  answer_format: Enums<"answer_format"> | null;
  options: RunnerOption[];
}

/** Lựa chọn user gửi lên khi nộp bài. */
export interface QuizSelection {
  questionId: string;
  selectedKeys: string[];
}

/** 1 câu trong trang KẾT QUẢ (kèm đáp án đúng + giải thích). */
export interface QuizReviewItem {
  id: string;
  slug: string;
  prompt_md: string;
  code_snippet: string | null;
  code_language: string | null;
  options: QuizOption[];
  correctKeys: string[];
  selectedKeys: string[];
  isCorrect: boolean;
  answer_md: string | null;
}

export type QuizAttempt = Tables<"quiz_attempts">;
