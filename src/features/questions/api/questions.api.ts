import type { SupabaseClient } from "@supabase/supabase-js";

import { PAGINATION } from "@/constants/config";
import type { Database } from "@/lib/supabase/database.types";
import type { Tables } from "@/types/db";
import type { QuestionDetail, QuestionFilters, QuestionListItem } from "../types";

type Client = SupabaseClient<Database>;

const LIST_SELECT =
  "id, slug, prompt_md, type, level, difficulty, frequency, topics(name, slug, categories(name, slug, color))";

type ListRaw = Pick<
  Tables<"questions">,
  "id" | "slug" | "prompt_md" | "type" | "level" | "difficulty" | "frequency"
> & {
  topics:
    | { name: string; slug: string; categories: { name: string; slug: string; color: string | null } | null }
    | null;
};

const DETAIL_SELECT =
  "*, topics(name, slug, level, categories(name, slug, color)), question_tags(tags(name, slug))";

type DetailRaw = Tables<"questions"> & {
  topics:
    | {
        name: string;
        slug: string;
        level: QuestionDetail["level"];
        categories: { name: string; slug: string; color: string | null } | null;
      }
    | null;
  question_tags: { tags: { name: string; slug: string } | null }[];
};

/** Ranh giới data-access DUY NHẤT của domain questions. */
export const questionsApi = {
  /** Danh sách câu hỏi đã publish, lọc theo level/type/topic/search. */
  async list(client: Client, filters: QuestionFilters = {}): Promise<QuestionListItem[]> {
    let query = client
      .from("questions")
      .select(LIST_SELECT)
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("frequency", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(PAGINATION.DEFAULT_PAGE_SIZE);

    if (filters.level) query = query.eq("level", filters.level);
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.topicId) query = query.eq("topic_id", filters.topicId);
    if (filters.search) query = query.ilike("prompt_md", `%${filters.search}%`);

    const { data, error } = await query.returns<ListRaw[]>();
    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      prompt_md: row.prompt_md,
      type: row.type,
      level: row.level,
      difficulty: row.difficulty,
      frequency: row.frequency,
      topic: row.topics
        ? { name: row.topics.name, slug: row.topics.slug, category: row.topics.categories }
        : null,
    }));
  },

  /** Chi tiết 1 câu hỏi theo slug (null nếu không tồn tại / chưa publish). */
  async getBySlug(client: Client, slug: string): Promise<QuestionDetail | null> {
    const { data, error } = await client
      .from("questions")
      .select(DETAIL_SELECT)
      .eq("slug", slug)
      .eq("is_published", true)
      .is("deleted_at", null)
      .limit(1)
      .returns<DetailRaw[]>();

    if (error) throw new Error(error.message);
    const row = data?.[0];
    if (!row) return null;

    const { topics, question_tags, ...question } = row;
    return {
      ...question,
      topic: topics
        ? { name: topics.name, slug: topics.slug, level: topics.level, category: topics.categories }
        : null,
      tags: question_tags.map((qt) => qt.tags).filter((t): t is { name: string; slug: string } => t !== null),
    };
  },
};
