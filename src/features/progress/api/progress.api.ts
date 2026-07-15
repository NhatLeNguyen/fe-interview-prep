import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type { Enums } from "@/types/db";
import type { DashboardData } from "../types";

type Client = SupabaseClient<Database>;
type ActivityType = Enums<"activity_type">;
type FlashcardState = Enums<"flashcard_state">;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const progressApi = {
  /**
   * Ghi 1 hoạt động học + cập nhật streak (cache trên profiles). Best-effort: nuốt lỗi
   * để không làm hỏng action chính (quiz/flashcard).
   *
   * BẢO MẬT: user_activity + cột streak là "KẾT QUẢ" (nguồn tính XP/hạng/badge) nên
   * migration 0010 đã REVOKE quyền ghi của `authenticated` -> phải ghi bằng ADMIN client.
   * Hàm này CHỈ được gọi từ server action SAU KHI đã xác minh việc học là thật.
   * `client` (user client) chỉ dùng để ĐỌC hồ sơ.
   */
  async logActivity(
    client: Client,
    userId: string,
    activityType: ActivityType,
    refId: string | null = null,
  ): Promise<void> {
    const admin = createAdminClient();
    const today = todayStr();
    await admin
      .from("user_activity")
      .insert({ user_id: userId, activity_type: activityType, ref_id: refId, activity_date: today });

    const { data: profile } = await client
      .from("profiles")
      .select("current_streak, longest_streak, last_active_date")
      .eq("id", userId)
      .maybeSingle();
    if (!profile || profile.last_active_date === today) return;

    const nextStreak = profile.last_active_date === yesterdayStr() ? profile.current_streak + 1 : 1;
    await admin
      .from("profiles")
      .update({
        current_streak: nextStreak,
        longest_streak: Math.max(profile.longest_streak, nextStreak),
        last_active_date: today,
      })
      .eq("id", userId);
  },

  /** Tổng hợp số liệu cho dashboard. */
  async getDashboard(client: Client, userId: string): Promise<DashboardData> {
    const today = todayStr();

    const [profileRes, dueRes, cardsRes, quizRes] = await Promise.all([
      client
        .from("profiles")
        .select("current_streak, longest_streak")
        .eq("id", userId)
        .maybeSingle(),
      client
        .from("flashcard_states")
        .select("question_id", { count: "exact", head: true })
        .eq("user_id", userId)
        .lte("due_at", today),
      client.from("flashcard_states").select("state").eq("user_id", userId),
      client
        .from("quiz_attempts")
        .select("score")
        .eq("user_id", userId)
        .eq("status", "completed"),
    ]);

    const byState = { new: 0, learning: 0, review: 0, relearning: 0 } as Record<
      FlashcardState,
      number
    >;
    for (const row of cardsRes.data ?? []) byState[row.state] += 1;

    const scores = (quizRes.data ?? []).map((r) => Number(r.score)).filter((n) => !Number.isNaN(n));
    const avgScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    return {
      streak: {
        current: profileRes.data?.current_streak ?? 0,
        longest: profileRes.data?.longest_streak ?? 0,
      },
      dueToday: dueRes.count ?? 0,
      flashcards: { total: cardsRes.data?.length ?? 0, byState },
      quiz: { attempts: scores.length, avgScore },
    };
  },
};
