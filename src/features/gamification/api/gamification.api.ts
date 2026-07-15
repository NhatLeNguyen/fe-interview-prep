import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { LEADERBOARD_LIMIT } from "../constants";
import { statValue } from "../helpers/criteria";
import type { BadgeState, LeaderboardRow, UserStats } from "../types";

type Client = SupabaseClient<Database>;

export const gamificationApi = {
  /** Số liệu của user: XP (RPC), streak, số lượt học/quiz, số bài code đã giải. */
  async getStats(client: Client, userId: string): Promise<UserStats> {
    const [xpRes, profileRes, studyRes, quizRes, solvedRes] = await Promise.all([
      client.rpc("my_xp"),
      client.from("profiles").select("current_streak").eq("id", userId).maybeSingle(),
      client
        .from("user_activity")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("activity_type", "study"),
      client
        .from("user_activity")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("activity_type", "quiz"),
      client
        .from("coding_submissions")
        .select("problem_id")
        .eq("user_id", userId)
        .eq("status", "passed"),
    ]);

    const codingSolved = new Set((solvedRes.data ?? []).map((r) => r.problem_id)).size;
    return {
      xp: typeof xpRes.data === "number" ? xpRes.data : 0,
      streak: profileRes.data?.current_streak ?? 0,
      study: studyRes.count ?? 0,
      quiz: quizRes.count ?? 0,
      codingSolved,
    };
  },

  /** Toàn bộ badge + trạng thái đạt/tiến độ của user. */
  async getBadgeStates(client: Client, userId: string, stats: UserStats): Promise<BadgeState[]> {
    const [defsRes, earnedRes] = await Promise.all([
      client
        .from("badges")
        .select("id, slug, name, description, icon, criteria_type, threshold")
        .order("sort_order", { ascending: true }),
      client.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
    ]);
    if (defsRes.error) throw new Error(defsRes.error.message);

    const earned = new Map((earnedRes.data ?? []).map((r) => [r.badge_id, r.earned_at]));
    return (defsRes.data ?? []).map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description,
      icon: b.icon,
      criteriaType: b.criteria_type,
      threshold: b.threshold,
      earned: earned.has(b.id),
      earnedAt: earned.get(b.id) ?? null,
      progress: statValue(stats, b.criteria_type),
    }));
  },

  /** Bảng xếp hạng ẨN DANH (RPC chỉ trả rank + xp). */
  async getLeaderboard(client: Client, limit = LEADERBOARD_LIMIT): Promise<LeaderboardRow[]> {
    const { data } = await client.rpc("leaderboard_anon", { p_limit: limit });
    return (data ?? []) as LeaderboardRow[];
  },

  /** Hạng của chính mình (RPC). */
  async getMyRank(client: Client): Promise<number | null> {
    const { data } = await client.rpc("my_rank");
    return typeof data === "number" ? data : null;
  },
};
