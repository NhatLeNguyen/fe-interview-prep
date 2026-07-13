import { Route } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { LevelBadge } from "@/components/common/level-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { learningPathApi } from "@/features/learning-path";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Lộ trình học" };

export default async function LearningPathsPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  const paths = await learningPathApi.listPaths(supabase, user?.id ?? null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Lộ trình học</h1>
        <p className="text-muted-foreground mt-1">
          Học có hệ thống từ junior đến senior — biết học gì trước, gì sau.
        </p>
      </header>

      {paths.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Chưa có lộ trình nào"
          description="Chạy file supabase/seeds/03_learning_paths.sql để thêm lộ trình mẫu."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paths.map((p) => {
            const pct = p.totalItems ? Math.round((p.completedItems / p.totalItems) * 100) : 0;
            return (
              <Link key={p.id} href={ROUTES.LEARNING_PATH_DETAIL(p.slug)} className="group block">
                <Card className="hover:border-primary/40 h-full transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary text-base">{p.title}</CardTitle>
                      <LevelBadge level={p.target_level} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground line-clamp-2 text-sm">{p.description}</p>
                    <div className="space-y-1">
                      <div className="text-muted-foreground flex justify-between text-xs">
                        <span>{p.totalItems} mục</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
