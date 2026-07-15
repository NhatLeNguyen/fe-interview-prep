import type { Enums } from "@/types/db";

/** 1 câu trong phiên phỏng vấn (kèm câu trả lời của user nếu có). */
export interface InterviewQuestionItem {
  questionId: string;
  orderIndex: number;
  promptMd: string;
  answerMd: string | null;
  topicName: string | null;
  type: Enums<"question_type">;
  answerText: string | null;
  selfRating: number | null;
}

/** Chi tiết 1 phiên. */
export interface InterviewSessionDetail {
  id: string;
  /** Chủ sở hữu phiên — dùng để admin (đọc được mọi phiên) chỉ xem, không thao tác. */
  userId: string;
  level: Enums<"level">;
  categorySlug: string | null;
  totalQuestions: number;
  status: Enums<"attempt_status">;
  selfScore: number | null;
  startedAt: string;
  items: InterviewQuestionItem[];
}

/** 1 dòng lịch sử phiên. */
export interface InterviewSessionSummary {
  id: string;
  level: Enums<"level">;
  totalQuestions: number;
  status: Enums<"attempt_status">;
  selfScore: number | null;
  startedAt: string;
  answered: number;
}
