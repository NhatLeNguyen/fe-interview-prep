import { MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { LevelBadge } from "@/components/common/level-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { InterviewBuilder, interviewApi } from "@/features/interview";
import { questionsApi } from "@/features/questions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Phỏng vấn thử" };

export default async function MockInterviewPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  const [categories, sessions] = await Promise.all([
    questionsApi.listCategories(supabase),
    interviewApi.listSessions(supabase, user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Phỏng vấn thử</h1>
        <p className="text-muted-foreground mt-1">
          Trả lời như phỏng vấn thật, đối chiếu đáp án mẫu rồi tự chấm 1–5.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tạo phiên mới</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewBuilder categories={categories} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lịch sử</h2>
        {sessions.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="Chưa có phiên nào"
            description="Tạo phiên đầu tiên ở trên để bắt đầu luyện."
          />
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={ROUTES.INTERVIEW_SESSION(s.id)}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LevelBadge level={s.level} />
                    <span className="text-muted-foreground tabular-nums">
                      {s.answered}/{s.totalQuestions} câu
                    </span>
                  </div>
                  <span className="tabular-nums">
                    {s.status === "completed" ? (
                      <span className="font-medium">{s.selfScore ?? 0}%</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">Đang làm</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
