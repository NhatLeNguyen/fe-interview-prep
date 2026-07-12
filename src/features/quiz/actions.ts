"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { LEVELS } from "@/constants/taxonomy";
import { shuffle } from "@/helpers/array";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { QUIZ_ALL, QUIZ_DEFAULT_COUNT, QUIZ_MAX_COUNT, QUIZ_MIN_COUNT } from "./constants";
import { quizApi } from "./api/quiz.api";
import { scoreQuiz } from "./helpers/scoring";
import type { QuizLevel, QuizSelection } from "./types";

/** Tạo quiz tùy chọn: bốc câu type='quiz' theo filter -> lưu attempt -> vào trang làm bài. */
export async function startCustomQuiz(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const categoryRaw = String(formData.get("category") ?? QUIZ_ALL);
  const levelRaw = String(formData.get("level") ?? QUIZ_ALL);
  const count = Math.min(
    Math.max(Number(formData.get("count")) || QUIZ_DEFAULT_COUNT, QUIZ_MIN_COUNT),
    QUIZ_MAX_COUNT,
  );

  const categorySlug = categoryRaw !== QUIZ_ALL ? categoryRaw : undefined;
  // Validate level thuộc enum (chống POST thủ công gây lỗi PostgREST -> 500).
  const level = (LEVELS as readonly string[]).includes(levelRaw)
    ? (levelRaw as QuizLevel)
    : undefined;

  const allIds = await quizApi.pickQuizQuestionIds(supabase, { categorySlug, level });
  const ids = shuffle(allIds, Math.random).slice(0, count);
  if (ids.length === 0) redirect(`${ROUTES.QUIZ}?error=empty`);

  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_source: "custom",
      quiz_set_id: null,
      config: { category: categoryRaw, level: levelRaw, requested: count },
      question_ids: ids,
      total_questions: ids.length,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error || !attempt) redirect(`${ROUTES.QUIZ}?error=start`);
  redirect(ROUTES.QUIZ_ATTEMPT(attempt.id));
}

/** Nộp bài: chấm điểm server-authoritative (qua admin client vì authenticated bị revoke UPDATE). */
export async function submitQuiz(attemptId: string, selections: QuizSelection[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const attempt = await quizApi.getAttempt(supabase, attemptId);
  if (!attempt || attempt.user_id !== user.id) redirect(ROUTES.QUIZ);
  if (attempt.status === "completed") redirect(ROUTES.QUIZ_RESULT(attemptId));

  // Lấy correct_keys (questions public read); chấm bằng helper thuần.
  // Check lỗi: nếu fetch fail -> KHÔNG chấm bậy (tránh khoá 0% completed). Attempt vẫn in_progress.
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, correct_keys")
    .in("id", attempt.question_ids);
  if (qErr) redirect(`${ROUTES.QUIZ}?error=submit`);
  const correctById = new Map((questions ?? []).map((q) => [q.id, q.correct_keys ?? []]));

  const score = scoreQuiz(
    attempt.question_ids.map((id) => ({
      questionId: id,
      selectedKeys: selections.find((s) => s.questionId === id)?.selectedKeys ?? [],
      correctKeys: correctById.get(id) ?? [],
    })),
  );

  // Persist qua ADMIN (service_role): authenticated không được UPDATE quiz_attempts / set is_correct.
  const admin = createAdminClient();
  const { error: answersErr } = await admin.from("quiz_attempt_answers").upsert(
    score.answers.map((a) => ({
      attempt_id: attemptId,
      user_id: user.id,
      question_id: a.questionId,
      selected_keys: a.selectedKeys,
      is_correct: a.isCorrect,
    })),
    { onConflict: "attempt_id,question_id" },
  );
  if (answersErr) redirect(`${ROUTES.QUIZ}?error=submit`);

  const { error: updateErr } = await admin
    .from("quiz_attempts")
    .update({
      status: "completed",
      score: score.percent,
      correct_count: score.correct,
      total_questions: score.total,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("user_id", user.id); // defense-in-depth (đã verify ownership ở trên)
  if (updateErr) redirect(`${ROUTES.QUIZ}?error=submit`);

  revalidatePath(ROUTES.QUIZ_RESULT(attemptId));
  redirect(ROUTES.QUIZ_RESULT(attemptId));
}
