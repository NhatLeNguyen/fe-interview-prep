// Hàm THUẦN chấm điểm quiz — không import React, không chạm DB.

export interface AnswerInput {
  questionId: string;
  selectedKeys: string[];
  correctKeys: string[];
}

export interface GradedAnswer extends AnswerInput {
  isCorrect: boolean;
}

export interface QuizScore {
  correct: number;
  total: number;
  ratio: number; // 0..1
  percent: number; // 0..100 (làm tròn)
  answers: GradedAnswer[];
}

/**
 * Đúng khi tập `selectedKeys` BẰNG ĐÚNG tập `correctKeys` (áp dụng cho single & multiple choice).
 * Multiple choice phải chọn đủ & đúng toàn bộ mới tính điểm (theo AC docs/02).
 */
export function isAnswerCorrect(selectedKeys: string[], correctKeys: string[]): boolean {
  if (correctKeys.length === 0) return false;
  const selected = new Set(selectedKeys);
  const correct = new Set(correctKeys);
  if (selected.size !== correct.size) return false;
  for (const key of correct) {
    if (!selected.has(key)) return false;
  }
  return true;
}

/** Chấm toàn bộ bài: mỗi câu đúng = 1 điểm. */
export function scoreQuiz(answers: AnswerInput[]): QuizScore {
  const graded: GradedAnswer[] = answers.map((a) => ({
    ...a,
    isCorrect: isAnswerCorrect(a.selectedKeys, a.correctKeys),
  }));
  const total = graded.length;
  const correct = graded.filter((g) => g.isCorrect).length;
  const ratio = total === 0 ? 0 : correct / total;
  return { correct, total, ratio, percent: Math.round(ratio * 100), answers: graded };
}
