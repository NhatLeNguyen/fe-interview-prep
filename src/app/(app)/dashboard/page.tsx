import { BookOpenCheck, Flame, Layers, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StatCard } from "@/components/common/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { progressApi } from "@/features/progress";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const STATE_LABELS = {
  new: "Mới",
  learning: "Đang học",
  review: "Ôn lại",
  relearning: "Học lại",
} as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  const [profileRes, data] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    progressApi.getDashboard(supabase, user.id),
  ]);
  const fullName = profileRes.data?.full_name;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Xin chào{fullName ? `, ${fullName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Tổng quan tiến độ học của bạn.</p>
      </header>

      {/* Ôn tập hôm nay */}
      <Card className={data.dueToday > 0 ? "border-primary/40 bg-primary/5" : undefined}>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="font-medium">Ôn tập hôm nay</p>
            <p className="text-muted-foreground text-sm">
              {data.dueToday > 0
                ? `${data.dueToday} thẻ đang chờ bạn ôn lại.`
                : "Không có thẻ nào đến hạn hôm nay 🎉"}
            </p>
          </div>
          <Link
            href={ROUTES.REVIEW}
            className={buttonVariants({ variant: data.dueToday > 0 ? "default" : "outline" })}
          >
            {data.dueToday > 0 ? "Ôn ngay" : "Xem bộ ôn tập"}
          </Link>
        </CardContent>
      </Card>

      {/* Số liệu */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Chuỗi ngày học"
          value={data.streak.current}
          hint={`kỷ lục ${data.streak.longest}`}
        />
        <StatCard icon={Layers} label="Thẻ đang ôn" value={data.flashcards.total} />
        <StatCard
          icon={Target}
          label="Điểm quiz TB"
          value={data.quiz.avgScore != null ? `${data.quiz.avgScore}%` : "—"}
        />
        <StatCard icon={BookOpenCheck} label="Lượt quiz" value={data.quiz.attempts} />
      </div>

      {/* Flashcard theo trạng thái */}
      {data.flashcards.total > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flashcard theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(STATE_LABELS) as (keyof typeof STATE_LABELS)[]).map((state) => (
              <div key={state} className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold tabular-nums">{data.flashcards.byState[state]}</p>
                <p className="text-muted-foreground text-xs">{STATE_LABELS[state]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
