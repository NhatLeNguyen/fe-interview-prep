"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { progressApi } from "@/features/progress";
import { createClient } from "@/lib/supabase/server";

/** Đánh dấu hoàn thành / bỏ hoàn thành 1 item trong lộ trình (RLS owner_all). */
export async function toggleItemComplete(
  pathId: string,
  slug: string,
  itemId: string,
  completed: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  // Xác thực item thuộc đúng path (RLS tự lọc path chưa publish / đã xoá).
  // Chặn ghi tiến độ cho cặp (path, item) không khớp -> completedItems luôn nhất quán.
  const { data: item, error: itemErr } = await supabase
    .from("learning_path_items")
    .select("id")
    .eq("id", itemId)
    .eq("path_id", pathId)
    .maybeSingle();
  if (itemErr) throw new Error(itemErr.message);
  if (!item) throw new Error("Item không hợp lệ cho lộ trình này.");

  const { error } = await supabase.from("learning_path_progress").upsert(
    {
      user_id: user.id,
      path_id: pathId,
      item_id: itemId,
      status: completed ? "completed" : "not_started",
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,item_id" },
  );
  if (error) throw new Error(error.message);

  if (completed) {
    await progressApi.logActivity(supabase, user.id, "path", pathId).catch(() => {});
  }

  revalidatePath(ROUTES.LEARNING_PATH);
  revalidatePath(ROUTES.LEARNING_PATH_DETAIL(slug));
}
