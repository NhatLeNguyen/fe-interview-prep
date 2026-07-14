import { Code2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { LevelBadge } from "@/components/common/level-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { codingApi } from "@/features/coding";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Luyện code" };

export default async function CodingPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  const problems = await codingApi.listProblems(supabase, user?.id ?? null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Luyện code</h1>
        <p className="text-muted-foreground mt-1">
          Viết hàm JavaScript, chạy thử và được chấm tự động bằng test case.
        </p>
      </header>

      {problems.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="Chưa có bài code nào"
          description="Chạy supabase/seeds/04_coding.sql để thêm bài mẫu."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <Link key={p.id} href={ROUTES.CODING_DETAIL(p.slug)} className="group block">
              <Card className="hover:border-primary/40 h-full transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="group-hover:text-primary text-base">{p.title}</CardTitle>
                    <LevelBadge level={p.level} />
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{p.topicName ?? "—"}</span>
                  {p.solved ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                      Đã giải
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Độ khó {p.difficulty}/5</span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
