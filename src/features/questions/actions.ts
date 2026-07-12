"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

/** Thêm/xoá bookmark câu hỏi cho user hiện tại (RLS bookmarks_owner_all bảo vệ). */
export async function toggleBookmark(questionId: string, shouldBookmark: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (shouldBookmark) {
    await supabase
      .from("bookmarks")
      .upsert(
        { user_id: user.id, question_id: questionId },
        { onConflict: "user_id,question_id", ignoreDuplicates: true },
      );
  } else {
    await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("question_id", questionId);
  }

  revalidatePath(ROUTES.BOOKMARKS);
}
