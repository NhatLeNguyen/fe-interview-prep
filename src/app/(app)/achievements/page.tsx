import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import {
  BadgeGrid,
  BadgeSync,
  gamificationApi,
  LeaderboardCard,
  XpCard,
} from "@/features/gamification";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Thành tích" };

export default async function AchievementsPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  const stats = await gamificationApi.getStats(supabase, user.id);
  const [badges, leaderboard, myRank] = await Promise.all([
    gamificationApi.getBadgeStates(supabase, user.id, stats),
    gamificationApi.getLeaderboard(supabase),
    gamificationApi.getMyRank(supabase),
  ]);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-6">
      {/* Trao badge còn thiếu (ngầm), rồi refresh nếu có badge mới. */}
      <BadgeSync />

      <header>
        <h1 className="text-2xl font-bold tracking-tight">Thành tích</h1>
        <p className="text-muted-foreground mt-1">
          XP, cấp độ, huy hiệu và thứ hạng của bạn.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <XpCard xp={stats.xp} rank={myRank} />
        <LeaderboardCard rows={leaderboard} myRank={myRank} />
      </div>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Huy hiệu</h2>
          <span className="text-muted-foreground text-sm tabular-nums">
            {earnedCount}/{badges.length}
          </span>
        </div>
        {badges.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Chưa có huy hiệu nào — chạy supabase/seeds/05_badges.sql để thêm.
          </p>
        ) : (
          <BadgeGrid badges={badges} />
        )}
      </section>
    </div>
  );
}
