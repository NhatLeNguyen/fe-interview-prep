import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { Tables } from "@/types/db";

type Client = SupabaseClient<Database>;

export interface AdminQuestionRow {
  id: string;
  slug: string;
  prompt_md: string;
  type: Tables<"questions">["type"];
  level: Tables<"questions">["level"];
  difficulty: number;
  is_published: boolean;
  deleted_at: string | null;
  topic: { name: string } | null;
}

export interface TopicOption {
  id: string;
  name: string;
  category: string;
}

/** API cho khu vực admin. RLS is_admin() bảo vệ ghi; đọc questions admin thấy cả chưa publish. */
export const adminApi = {
  /** Danh sách tất cả câu hỏi (admin thấy cả chưa publish, chưa xoá mềm). */
  async listQuestions(client: Client): Promise<AdminQuestionRow[]> {
    const { data, error } = await client
      .from("questions")
      .select("id, slug, prompt_md, type, level, difficulty, is_published, deleted_at, topics(name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<
        (Omit<AdminQuestionRow, "topic"> & { topics: { name: string } | null })[]
      >();
    if (error) throw new Error(error.message);
    return (data ?? []).map(({ topics, ...q }) => ({ ...q, topic: topics }));
  },

  async getQuestion(client: Client, id: string): Promise<Tables<"questions"> | null> {
    const { data, error } = await client.from("questions").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  /** Topic để chọn trong form (kèm tên category). */
  async listTopics(client: Client): Promise<TopicOption[]> {
    const { data, error } = await client
      .from("topics")
      .select("id, name, categories!inner(name)")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .returns<{ id: string; name: string; categories: { name: string } }[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map((t) => ({ id: t.id, name: t.name, category: t.categories.name }));
  },
};
