"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { gamificationApi } from "./api/gamification.api";
import { meetsCriteria } from "./helpers/criteria";

/**
 * Xét & trao các badge đã đủ điều kiện cho user hiện tại. Trả số badge MỚI nhận.
 * Gọi ngầm khi mở trang Thành tích (side-effect nằm ngoài render).
 * Guest -> no-op (không redirect vì đây là lời gọi ngầm).
 *
 * BẢO MẬT: badge là "KẾT QUẢ" -> migration 0010 REVOKE quyền ghi user_badges của
 * `authenticated` (chặn tự trao badge từ trình duyệt). Điều kiện tính Ở ĐÂY (server),
 * rồi ghi bằng ADMIN client.
 */
export async function syncBadges(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const stats = await gamificationApi.getStats(supabase, user.id);
  const badges = await gamificationApi.getBadgeStates(supabase, user.id, stats);

  const toAward = badges.filter(
    (b) => !b.earned && meetsCriteria(stats, b.criteriaType, b.threshold),
  );
  if (toAward.length === 0) return 0;

  // Ghi bằng admin (client đã bị revoke). unique(user_id,badge_id) chống trùng khi đua.
  const { error } = await createAdminClient()
    .from("user_badges")
    .upsert(
      toAward.map((b) => ({ user_id: user.id, badge_id: b.id })),
      { onConflict: "user_id,badge_id", ignoreDuplicates: true },
    );
  if (error) return 0;
  return toAward.length;
}
