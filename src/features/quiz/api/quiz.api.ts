import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { Tables } from "@/types/db";
import type { QuizLevel, QuizOption, QuizReviewItem, RunnerQuestion } from "../types";

type Client = SupabaseClient<Database>;

function asOptions(value: unknown): QuizOption[] {
  return Array.isArray(value) ? (value as QuizOption[]) : [];
}

/** Ranh giới data-access DUY NHẤT của domain quiz. */
export const quizApi = {
  /** Chọn id các câu hỏi type='quiz' theo bộ lọc (để bốc ngẫu nhiên tạo bộ đề). */
  async pickQuizQuestionIds(
    client: Client,
    opts: { categorySlug?: string; level?: QuizLevel },
  ): Promise<string[]> {
    let query = client
      .from("questions")
      .select("id, topics!inner(categories!inner(slug))")
      .eq("is_published", true)
      .is("deleted_at", null)
      .eq("type", "quiz");

    if (opts.level) query = query.eq("level", opts.level);
    if (opts.categorySlug) query = query.eq("topics.categories.slug", opts.categorySlug);

    const { data, error } = await query.limit(80).returns<{ id: string }[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.id);
  },

  async getAttempt(client: Client, attemptId: string): Promise<Tables<"quiz_attempts"> | null> {
    const { data, error } = await client
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  /** Câu hỏi để làm bài (không có correct_keys), giữ đúng thứ tự questionIds. */
  async getRunnerQuestions(client: Client, questionIds: string[]): Promise<RunnerQuestion[]> {
    if (questionIds.length === 0) return [];
    const { data, error } = await client
      .from("questions")
      .select("id, prompt_md, code_snippet, code_language, answer_format, options")
      .in("id", questionIds)
      .eq("type", "quiz");
    if (error) throw new Error(error.message);

    const byId = new Map((data ?? []).map((q) => [q.id, q]));
    return questionIds
      .map((id) => byId.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map((q) => ({
        id: q.id,
        prompt_md: q.prompt_md,
        code_snippet: q.code_snippet,
        code_language: q.code_language,
        answer_format: q.answer_format,
        // CHỈ gửi key + text (strip explanation) — tránh lộ đáp án ra client khi làm bài.
        options: asOptions(q.options).map((o) => ({ key: o.key, text: o.text })),
      }));
  },

  /** Dữ liệu trang kết quả: attempt + review từng câu (có đáp án đúng + giải thích). */
  async getReview(
    client: Client,
    attemptId: string,
  ): Promise<{ attempt: Tables<"quiz_attempts">; items: QuizReviewItem[] } | null> {
    const { data: attempt, error: attemptErr } = await client
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .maybeSingle();
    if (attemptErr) throw new Error(attemptErr.message);
    if (!attempt) return null;

    const { data: answers } = await client
      .from("quiz_attempt_answers")
      .select("question_id, selected_keys, is_correct")
      .eq("attempt_id", attemptId);
    const answerByQ = new Map((answers ?? []).map((a) => [a.question_id, a]));

    const { data: questions } = await client
      .from("questions")
      .select("id, slug, prompt_md, code_snippet, code_language, options, correct_keys, answer_md")
      .in("id", attempt.question_ids);
    const questionById = new Map((questions ?? []).map((q) => [q.id, q]));

    const items: QuizReviewItem[] = attempt.question_ids
      .map((id) => questionById.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map((q) => {
        const answer = answerByQ.get(q.id);
        return {
          id: q.id,
          slug: q.slug,
          prompt_md: q.prompt_md,
          code_snippet: q.code_snippet,
          code_language: q.code_language,
          options: asOptions(q.options),
          correctKeys: q.correct_keys ?? [],
          selectedKeys: answer?.selected_keys ?? [],
          isCorrect: answer?.is_correct ?? false,
          answer_md: q.answer_md,
        };
      });

    return { attempt, items };
  },
};
