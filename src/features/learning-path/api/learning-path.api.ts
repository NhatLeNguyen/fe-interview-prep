import type { SupabaseClient } from "@supabase/supabase-js";

import { ROUTES } from "@/constants/routes";
import type { Database } from "@/lib/supabase/database.types";
import type { PathDetail, PathItem, PathModule, PathSummary } from "../types";

type Client = SupabaseClient<Database>;

const DEFAULT_MODULE = "Nội dung";

/** Link tới nội dung học của 1 item theo item_type. */
function contentHref(it: {
  item_type: "topic" | "quiz_set" | "question";
  topics: { slug: string } | null;
  questions: { slug: string } | null;
}): string | null {
  if (it.item_type === "topic" && it.topics) {
    return `${ROUTES.QUESTIONS}?topic=${encodeURIComponent(it.topics.slug)}`;
  }
  if (it.item_type === "question" && it.questions) {
    return ROUTES.QUESTION_DETAIL(it.questions.slug);
  }
  return null; // quiz_set: chưa có route deep-link riêng
}

export const learningPathApi = {
  /** Chỉ lấy tiêu đề/mô tả (cho generateMetadata) — nhẹ hơn getPath. */
  async getPathMeta(
    client: Client,
    slug: string,
  ): Promise<{ title: string; description: string | null } | null> {
    const { data } = await client
      .from("learning_paths")
      .select("title, description")
      .eq("slug", slug)
      .eq("is_published", true)
      .is("deleted_at", null)
      .maybeSingle();
    return data ?? null;
  },

  /** Danh sách lộ trình + tiến độ (nếu đã đăng nhập). */
  async listPaths(client: Client, userId: string | null): Promise<PathSummary[]> {
    const { data: paths, error } = await client
      .from("learning_paths")
      .select("id, slug, title, description, target_level, learning_path_items(id)")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .returns<
        {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          target_level: PathSummary["target_level"];
          learning_path_items: { id: string }[];
        }[]
      >();
    if (error) throw new Error(error.message);

    // Đếm completed theo item hiện có của path (không tin path_id denormalize)
    // -> luôn bounded <= totalItems và khớp getPath.
    const itemToPath = new Map<string, string>();
    for (const p of paths ?? []) {
      for (const it of p.learning_path_items) itemToPath.set(it.id, p.id);
    }
    const completedByPath = new Map<string, number>();
    if (userId) {
      const { data: prog } = await client
        .from("learning_path_progress")
        .select("item_id")
        .eq("user_id", userId)
        .eq("status", "completed");
      for (const row of prog ?? []) {
        const pathId = itemToPath.get(row.item_id);
        if (pathId) completedByPath.set(pathId, (completedByPath.get(pathId) ?? 0) + 1);
      }
    }

    return (paths ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      target_level: p.target_level,
      totalItems: p.learning_path_items.length,
      completedItems: completedByPath.get(p.id) ?? 0,
    }));
  },

  /** Chi tiết lộ trình: items nhóm theo module + trạng thái hoàn thành của user. */
  async getPath(client: Client, slug: string, userId: string | null): Promise<PathDetail | null> {
    const { data: path } = await client
      .from("learning_paths")
      .select("id, slug, title, description, target_level")
      .eq("slug", slug)
      .eq("is_published", true)
      .is("deleted_at", null)
      .maybeSingle();
    if (!path) return null;

    const { data: rawItems } = await client
      .from("learning_path_items")
      .select(
        "id, title, module_title, step_key, is_optional, sort_order, item_type, topics(name, slug), questions(slug)",
      )
      .eq("path_id", path.id)
      .order("sort_order", { ascending: true })
      .returns<
        {
          id: string;
          title: string | null;
          module_title: string | null;
          step_key: string | null;
          is_optional: boolean;
          item_type: "topic" | "quiz_set" | "question";
          topics: { name: string; slug: string } | null;
          questions: { slug: string } | null;
        }[]
      >();

    const completedIds = new Set<string>();
    if (userId) {
      const { data: prog } = await client
        .from("learning_path_progress")
        .select("item_id")
        .eq("user_id", userId)
        .eq("path_id", path.id)
        .eq("status", "completed");
      for (const p of prog ?? []) completedIds.add(p.item_id);
    }

    const items: PathItem[] = (rawItems ?? []).map((it) => ({
      id: it.id,
      title: it.title ?? it.topics?.name ?? it.questions?.slug ?? "—",
      moduleTitle: it.module_title ?? DEFAULT_MODULE,
      stepKey: it.step_key,
      isOptional: it.is_optional,
      completed: completedIds.has(it.id),
      href: contentHref(it),
    }));

    const moduleMap = new Map<string, PathItem[]>();
    for (const it of items) {
      const list = moduleMap.get(it.moduleTitle) ?? [];
      list.push(it);
      moduleMap.set(it.moduleTitle, list);
    }
    const modules: PathModule[] = [...moduleMap.entries()].map(([title, moduleItems]) => ({
      title,
      items: moduleItems,
    }));

    return {
      id: path.id,
      slug: path.slug,
      title: path.title,
      description: path.description,
      target_level: path.target_level,
      modules,
      totalItems: items.length,
      completedItems: items.filter((i) => i.completed).length,
    };
  },
};
