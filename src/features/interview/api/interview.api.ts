import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { Enums } from "@/types/db";
import { INTERVIEW_TYPES } from "../constants";
import type { InterviewSessionDetail, InterviewSessionSummary } from "../types";

type Client = SupabaseClient<Database>;

export const interviewApi = {
  /**
   * Ứng viên câu hỏi cho phỏng vấn: đã publish, CÓ đáp án mẫu (answer_md) để user tự đối chiếu,
   * dạng theory/system-design/behavioral (không quiz/coding).
   */
  async pickQuestionIds(
    client: Client,
    filters: { categorySlug?: string; level?: Enums<"level"> },
  ): Promise<string[]> {
    let q = client
      .from("questions")
      .select("id, topics!inner(categories!inner(slug))")
      .eq("is_published", true)
      .is("deleted_at", null)
      .not("answer_md", "is", null)
      .in("type", [...INTERVIEW_TYPES]);

    if (filters.level) q = q.eq("level", filters.level);
    if (filters.categorySlug) q = q.eq("topics.categories.slug", filters.categorySlug);

    const { data, error } = await q.returns<{ id: string }[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.id);
  },

  /** Chi tiết phiên + các câu (kèm câu trả lời của user). Chỉ owner đọc được (RLS). */
  async getSession(
    client: Client,
    sessionId: string,
  ): Promise<InterviewSessionDetail | null> {
    const { data: s } = await client
      .from("interview_sessions")
      .select("id, user_id, level, category_slug, total_questions, status, self_score, started_at")
      .eq("id", sessionId)
      .maybeSingle();
    if (!s) return null;

    const { data: rows } = await client
      .from("interview_answers")
      .select(
        "question_id, order_index, answer_text, self_rating, questions!inner(prompt_md, answer_md, type, topics(name))",
      )
      .eq("session_id", sessionId)
      .order("order_index", { ascending: true })
      .returns<
        {
          question_id: string;
          order_index: number;
          answer_text: string | null;
          self_rating: number | null;
          questions: {
            prompt_md: string;
            answer_md: string | null;
            type: Enums<"question_type">;
            topics: { name: string } | null;
          };
        }[]
      >();

    return {
      id: s.id,
      userId: s.user_id,
      level: s.level,
      categorySlug: s.category_slug,
      totalQuestions: s.total_questions,
      status: s.status,
      selfScore: s.self_score,
      startedAt: s.started_at,
      items: (rows ?? []).map((r) => ({
        questionId: r.question_id,
        orderIndex: r.order_index,
        promptMd: r.questions.prompt_md,
        answerMd: r.questions.answer_md,
        topicName: r.questions.topics?.name ?? null,
        type: r.questions.type,
        answerText: r.answer_text,
        selfRating: r.self_rating,
      })),
    };
  },

  /** Lịch sử phiên của user (mới nhất trước). */
  async listSessions(client: Client, userId: string): Promise<InterviewSessionSummary[]> {
    const { data } = await client
      .from("interview_sessions")
      .select(
        "id, level, total_questions, status, self_score, started_at, interview_answers(self_rating)",
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(20)
      .returns<
        {
          id: string;
          level: Enums<"level">;
          total_questions: number;
          status: Enums<"attempt_status">;
          self_score: number | null;
          started_at: string;
          interview_answers: { self_rating: number | null }[];
        }[]
      >();

    return (data ?? []).map((s) => ({
      id: s.id,
      level: s.level,
      totalQuestions: s.total_questions,
      status: s.status,
      selfScore: s.self_score,
      startedAt: s.started_at,
      answered: s.interview_answers.filter((a) => a.self_rating != null).length,
    }));
  },
};
