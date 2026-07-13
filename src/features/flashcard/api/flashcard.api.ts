import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { REVIEW_QUEUE_LIMIT } from "../constants";
import type { ReviewCard } from "../types";

type Client = SupabaseClient<Database>;

/** Ngày hôm nay (UTC) dạng YYYY-MM-DD để so với cột due_at (date). */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const flashcardApi = {
  /** Hàng đợi ôn: thẻ due_at <= hôm nay, quá hạn lâu nhất trước. */
  async getDueCards(client: Client, userId: string): Promise<ReviewCard[]> {
    const { data, error } = await client
      .from("flashcard_states")
      .select("questions!inner(id, slug, prompt_md, answer_md, code_snippet, code_language)")
      .eq("user_id", userId)
      .lte("due_at", todayStr())
      .order("due_at", { ascending: true })
      .limit(REVIEW_QUEUE_LIMIT)
      .returns<{ questions: ReviewCard }[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.questions);
  },

  /** Số thẻ đến hạn (cho dashboard / badge). */
  async countDue(client: Client, userId: string): Promise<number> {
    const { count } = await client
      .from("flashcard_states")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("due_at", todayStr());
    return count ?? 0;
  },

  /** Câu hỏi đã có trong bộ ôn tập chưa. */
  async isAdded(client: Client, userId: string, questionId: string): Promise<boolean> {
    const { data } = await client
      .from("flashcard_states")
      .select("question_id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();
    return data !== null;
  },
};
