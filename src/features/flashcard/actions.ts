"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import {
  NEW_CARD,
  reviewCard,
  type ReviewGrade,
  type SrsState,
} from "@/helpers/spaced-repetition";
import { createClient } from "@/lib/supabase/server";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Thêm/xoá câu hỏi khỏi bộ ôn tập (flashcard_states, RLS owner_all). */
export async function toggleFlashcard(questionId: string, shouldAdd: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (shouldAdd) {
    await supabase
      .from("flashcard_states")
      .upsert(
        { user_id: user.id, question_id: questionId, state: "new", due_at: todayStr() },
        { onConflict: "user_id,question_id", ignoreDuplicates: true },
      );
  } else {
    await supabase
      .from("flashcard_states")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", questionId);
  }
  revalidatePath(ROUTES.REVIEW);
}

/** Chấm 1 thẻ (Again/Hard/Good/Easy) -> cập nhật SRS (SM-2) + ghi review_log. */
export async function gradeCard(questionId: string, grade: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { data: state } = await supabase
    .from("flashcard_states")
    .select("*")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  const prev: SrsState = state
    ? {
        state: state.state,
        easeFactor: Number(state.ease_factor),
        intervalDays: state.interval_days,
        repetitions: state.repetitions,
      }
    : NEW_CARD;

  const g = (Number.isInteger(grade) && grade >= 0 && grade <= 5 ? grade : 3) as ReviewGrade;
  const result = reviewCard(prev, g, new Date());
  const lapses = (state?.lapses ?? 0) + (g < 3 ? 1 : 0);

  await supabase.from("flashcard_states").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      ease_factor: result.easeFactor,
      interval_days: result.intervalDays,
      repetitions: result.repetitions,
      due_at: result.dueAt.toISOString().slice(0, 10),
      state: result.state,
      last_reviewed_at: new Date().toISOString(),
      last_grade: g,
      lapses,
    },
    { onConflict: "user_id,question_id" },
  );

  await supabase.from("review_logs").insert({
    user_id: user.id,
    question_id: questionId,
    grade: g,
    prev_interval_days: prev.intervalDays,
    new_interval_days: result.intervalDays,
    prev_ease: prev.easeFactor,
    new_ease: result.easeFactor,
    prev_state: state?.state ?? null,
    new_state: result.state,
  });
}
