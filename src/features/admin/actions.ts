"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { LEVELS, QUESTION_TYPES } from "@/constants/taxonomy";
import { slugify } from "@/helpers/string";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/db";
import type { AdminFormState } from "./types";

const LEVEL_SET = new Set<string>(LEVELS);
const TYPE_SET = new Set<string>(QUESTION_TYPES);
const ANSWER_FORMAT_SET = new Set(["single_choice", "multiple_choice", "true_false"]);
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
const empty = (v: FormDataEntryValue | null) => {
  const s = v == null ? "" : String(v).trim();
  return s.length > 0 ? s : null;
};

/** Chặn non-admin gọi server action trực tiếp (defense-in-depth NGOÀI RLS). */
async function requireAdmin(client: SupabaseClient<Database>): Promise<string> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);
  const { data } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") redirect(ROUTES.DASHBOARD);
  return user.id;
}

interface QuizParsed {
  answerFormat: Enums<"answer_format">;
  options: { key: string; text: string; explanation: string | null }[];
  correctKeys: string[];
}

/** Validate + parse phần trắc nghiệm: options đúng shape, keys unique, correct_keys ⊆ keys. */
function parseQuiz(formData: FormData): { error: string } | QuizParsed {
  const af = empty(formData.get("answer_format")) ?? "single_choice";
  if (!ANSWER_FORMAT_SET.has(af)) return { error: "Answer format không hợp lệ." };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("options_json") ?? "[]"));
  } catch {
    return { error: "Options JSON không hợp lệ." };
  }
  if (!Array.isArray(raw) || raw.length < 2) {
    return { error: "Câu trắc nghiệm cần ít nhất 2 lựa chọn (options JSON)." };
  }

  const keys = new Set<string>();
  const options: QuizParsed["options"] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return { error: "Mỗi option phải là object {key, text}." };
    const rec = item as Record<string, unknown>;
    const key = typeof rec.key === "string" ? rec.key.trim() : "";
    const text = typeof rec.text === "string" ? rec.text.trim() : "";
    if (!key || !text) return { error: "Mỗi option cần 'key' và 'text' không rỗng." };
    if (keys.has(key)) return { error: `Key option bị trùng: ${key}` };
    keys.add(key);
    options.push({ key, text, explanation: typeof rec.explanation === "string" ? rec.explanation : null });
  }

  const correctKeys = String(formData.get("correct_keys") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (correctKeys.length < 1) return { error: "Cần ít nhất 1 đáp án đúng." };
  for (const k of correctKeys) {
    if (!keys.has(k)) return { error: `Đáp án đúng '${k}' không nằm trong options.` };
  }
  if ((af === "single_choice" || af === "true_false") && correctKeys.length !== 1) {
    return { error: "Dạng single_choice / true_false chỉ có đúng 1 đáp án đúng." };
  }

  return { answerFormat: af as Enums<"answer_format">, options, correctKeys };
}

export async function saveQuestion(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const supabase = await createClient();
  const userId = await requireAdmin(supabase);

  const id = empty(formData.get("id"));
  const topicId = empty(formData.get("topic_id"));
  const type = String(formData.get("type") ?? "");
  const level = String(formData.get("level") ?? "");
  const promptMd = empty(formData.get("prompt_md"));
  const answerMd = empty(formData.get("answer_md"));
  const isPublished = formData.get("is_published") === "on";
  const difficulty = clamp(Number(formData.get("difficulty")) || 1, 1, 5);
  const frequency = clamp(Number(formData.get("frequency")) || 1, 1, 5);

  if (!topicId) return { error: "Vui lòng chọn chủ đề." };
  if (!TYPE_SET.has(type)) return { error: "Dạng câu hỏi không hợp lệ." };
  if (!LEVEL_SET.has(level)) return { error: "Cấp độ không hợp lệ." };
  if (!promptMd) return { error: "Vui lòng nhập đề bài." };
  if (isPublished && !answerMd) return { error: "Câu đã publish phải có đáp án." };

  let answerFormat: Enums<"answer_format"> | null = null;
  let options: QuizParsed["options"] | null = null;
  let correctKeys: string[] | null = null;
  if (type === "quiz") {
    const quiz = parseQuiz(formData);
    if ("error" in quiz) return quiz;
    answerFormat = quiz.answerFormat;
    options = quiz.options;
    correctKeys = quiz.correctKeys;
  }

  const payload = {
    topic_id: topicId,
    type: type as Enums<"question_type">,
    level: level as Enums<"level">,
    difficulty,
    frequency,
    prompt_md: promptMd,
    answer_md: answerMd,
    code_snippet: empty(formData.get("code_snippet")),
    code_language: empty(formData.get("code_language")),
    answer_format: answerFormat,
    options: options as never,
    correct_keys: correctKeys,
    is_published: isPublished,
  };

  if (id) {
    const { error } = await supabase.from("questions").update(payload).eq("id", id);
    if (error) return { error: "Không cập nhật được câu hỏi." };
  } else {
    const baseSlug = empty(formData.get("slug")) ?? (slugify(promptMd).slice(0, 60) || "cau-hoi");
    let { error } = await supabase
      .from("questions")
      .insert({ ...payload, slug: baseSlug, created_by: userId });
    if (error?.code === "23505") {
      // Slug trùng -> tự thêm hậu tố ngắn rồi thử lại (thay vì bắt admin đổi đề bài).
      const alt = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      ({ error } = await supabase
        .from("questions")
        .insert({ ...payload, slug: alt, created_by: userId }));
    }
    if (error) return { error: "Không tạo được câu hỏi. Vui lòng thử lại." };
  }

  revalidatePath(ROUTES.ADMIN_QUESTIONS);
  redirect(ROUTES.ADMIN_QUESTIONS);
}

/** Xoá mềm (giữ deleted_at). Trả về lỗi để UI hiển thị. */
export async function deleteQuestion(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq("id", id);
  if (error) return { error: "Không xoá được câu hỏi." };
  revalidatePath(ROUTES.ADMIN_QUESTIONS);
  return {};
}

/** Bật/tắt publish. Chặn publish câu chưa có đáp án (khớp chk_published_needs_answer). */
export async function togglePublish(id: string, next: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  await requireAdmin(supabase);
  if (next) {
    const { data: q } = await supabase.from("questions").select("answer_md").eq("id", id).maybeSingle();
    if (!q?.answer_md || !q.answer_md.trim()) {
      return { error: "Không thể publish câu chưa có đáp án." };
    }
  }
  const { error } = await supabase.from("questions").update({ is_published: next }).eq("id", id);
  if (error) return { error: "Không cập nhật được." };
  revalidatePath(ROUTES.ADMIN_QUESTIONS);
  return {};
}
