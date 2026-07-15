"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { LEVELS } from "@/constants/taxonomy";
import { progressApi } from "@/features/progress";
import { shuffle } from "@/helpers/array";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/db";
import { interviewApi } from "./api/interview.api";
import {
  INTERVIEW_ALL,
  INTERVIEW_DEFAULT_COUNT,
  INTERVIEW_MAX_COUNT,
  INTERVIEW_MIN_COUNT,
} from "./constants";
import { selfScore } from "./helpers/score";

/** Bắt đầu 1 phiên phỏng vấn: chọn ngẫu nhiên N câu theo cấp độ/chủ đề. */
export async function startInterview(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const categoryRaw = String(formData.get("category") ?? INTERVIEW_ALL);
  const levelRaw = String(formData.get("level") ?? INTERVIEW_ALL);
  const count = Math.min(
    Math.max(Number(formData.get("count")) || INTERVIEW_DEFAULT_COUNT, INTERVIEW_MIN_COUNT),
    INTERVIEW_MAX_COUNT,
  );

  const categorySlug = categoryRaw !== INTERVIEW_ALL ? categoryRaw : undefined;
  // Validate level thuộc enum (chống POST thủ công gây lỗi PostgREST).
  const level = (LEVELS as readonly string[]).includes(levelRaw)
    ? (levelRaw as Enums<"level">)
    : undefined;

  const allIds = await interviewApi.pickQuestionIds(supabase, { categorySlug, level });
  const ids = shuffle(allIds, Math.random).slice(0, count);
  if (ids.length === 0) redirect(`${ROUTES.INTERVIEW}?error=empty`);

  const { data: session, error } = await supabase
    .from("interview_sessions")
    .insert({
      user_id: user.id,
      level: level ?? "junior",
      category_slug: categorySlug ?? null,
      total_questions: ids.length,
      status: "in_progress",
    })
    .select("id")
    .single();
  if (error || !session) redirect(`${ROUTES.INTERVIEW}?error=start`);

  const { error: aErr } = await supabase.from("interview_answers").insert(
    ids.map((qid, i) => ({ session_id: session.id, question_id: qid, order_index: i })),
  );
  if (aErr) {
    // 2 lần insert không nguyên tử -> dọn session mồ côi (nếu không sẽ kẹt "Đang làm 0/N").
    await createAdminClient().from("interview_sessions").delete().eq("id", session.id);
    redirect(`${ROUTES.INTERVIEW}?error=start`);
  }

  redirect(ROUTES.INTERVIEW_SESSION(session.id));
}

/** Lưu câu trả lời + mức tự chấm cho 1 câu. */
export async function saveAnswer(
  sessionId: string,
  questionId: string,
  answerText: string,
  selfRating: number,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const rating = Math.min(Math.max(Math.round(selfRating), 1), 5);
  // RLS gate theo session cha -> user khác không ghi được.
  // .select().single(): UPDATE khớp 0 dòng vẫn trả 204/error=null -> phải ép lỗi
  // để UI không báo "đã lưu" khi thực chất không ghi được gì.
  const { error } = await supabase
    .from("interview_answers")
    .update({
      answer_text: answerText.slice(0, 10_000),
      self_rating: rating,
      answered_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId)
    .eq("question_id", questionId)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath(ROUTES.INTERVIEW_SESSION(sessionId));
}

/** Kết thúc phiên: tính điểm tự chấm trung bình + đánh dấu hoàn thành. */
export async function finishInterview(sessionId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { data: rows } = await supabase
    .from("interview_answers")
    .select("self_rating")
    .eq("session_id", sessionId);

  const score = selfScore((rows ?? []).map((r) => r.self_rating));

  // BẢO MẬT: self_score/status là KẾT QUẢ -> 0010 revoke UPDATE của authenticated,
  // ghi bằng admin. .eq("status","in_progress") + .select(): CHỈ chuyển trạng thái 1 lần
  // -> chặn replay action để farm XP vô hạn.
  const { data: updated, error } = await createAdminClient()
    .from("interview_sessions")
    .update({ status: "completed", self_score: score, finished_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .select("id");
  if (error) throw new Error(error.message);

  // Không có dòng nào chuyển trạng thái (đã completed / không phải của mình) -> không cộng XP.
  if (!updated || updated.length === 0) {
    revalidatePath(ROUTES.INTERVIEW_SESSION(sessionId));
    return;
  }

  await progressApi.logActivity(supabase, user.id, "study", sessionId).catch(() => {});

  revalidatePath(ROUTES.INTERVIEW_SESSION(sessionId));
  revalidatePath(ROUTES.INTERVIEW);
}
