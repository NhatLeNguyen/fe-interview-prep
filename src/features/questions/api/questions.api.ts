import type { SupabaseClient } from "@supabase/supabase-js";

import { PAGINATION } from "@/constants/config";
import type { Database } from "@/lib/supabase/database.types";
import type { Tables } from "@/types/db";
import { DEFAULT_SORT } from "../constants";
import type {
  CategoryOption,
  QuestionDetail,
  QuestionFilters,
  QuestionListItem,
} from "../types";

type Client = SupabaseClient<Database>;

// topics!inner / categories!inner: topic_id & category_id đều NOT NULL nên inner không loại bớt hàng,
// đồng thời cho phép filter theo topics.categories.slug.
const LIST_SELECT =
  "id, slug, prompt_md, type, level, difficulty, frequency, topics!inner(name, slug, categories!inner(name, slug, color))";

type ListRaw = Pick<
  Tables<"questions">,
  "id" | "slug" | "prompt_md" | "type" | "level" | "difficulty" | "frequency"
> & {
  topics:
    | { name: string; slug: string; categories: { name: string; slug: string; color: string | null } | null }
    | null;
};

function toListItem(row: ListRaw): QuestionListItem {
  return {
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
  };
}

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
  /** Danh sách câu hỏi đã publish theo bộ lọc (AND) + sort + FTS search. */
  async list(client: Client, filters: QuestionFilters = {}): Promise<QuestionListItem[]> {
    let filtered = client
      .from("questions")
      .select(LIST_SELECT)
      .eq("is_published", true)
      .is("deleted_at", null);

    if (filters.level) filtered = filtered.eq("level", filters.level);
    if (filters.type) filtered = filtered.eq("type", filters.type);
    if (filters.topicId) filtered = filtered.eq("topic_id", filters.topicId);
    if (filters.topicSlug) filtered = filtered.eq("topics.slug", filters.topicSlug);
    if (filters.categorySlug) filtered = filtered.eq("topics.categories.slug", filters.categorySlug);
    if (filters.search) {
      filtered = filtered.textSearch("search", filters.search, { type: "websearch", config: "simple" });
    }

    const sort = filters.sort ?? DEFAULT_SORT;
    const ordered =
      sort === "difficulty-asc"
        ? filtered.order("difficulty", { ascending: true }).order("frequency", { ascending: false })
        : sort === "difficulty-desc"
          ? filtered.order("difficulty", { ascending: false }).order("frequency", { ascending: false })
          : sort === "newest"
            ? filtered.order("created_at", { ascending: false })
            : filtered.order("frequency", { ascending: false }).order("created_at", { ascending: true });

    const { data, error } = await ordered.limit(PAGINATION.DEFAULT_PAGE_SIZE).returns<ListRaw[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map(toListItem);
  },

  /** Danh sách category (option cho bộ lọc). */
  async listCategories(client: Client): Promise<CategoryOption[]> {
    const { data, error } = await client
      .from("categories")
      .select("id, slug, name, color")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .returns<CategoryOption[]>();
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Câu hỏi user đã bookmark (mới nhất trước). */
  async listBookmarked(client: Client, userId: string): Promise<QuestionListItem[]> {
    const { data, error } = await client
      .from("bookmarks")
      .select(`questions!inner(${LIST_SELECT})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<{ questions: ListRaw }[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => toListItem(row.questions));
  },

  /** 1 câu hỏi có được user bookmark không. */
  async isBookmarked(client: Client, userId: string, questionId: string): Promise<boolean> {
    const { data, error } = await client
      .from("bookmarks")
      .select("question_id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data !== null;
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
      tags: question_tags
        .map((qt) => qt.tags)
        .filter((t): t is { name: string; slug: string } => t !== null),
    };
  },
};
