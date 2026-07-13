import { CheckCircle2, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { authApi } from "@/features/auth";
import { quizApi } from "@/features/quiz";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Kết quả quiz" };

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function QuizResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  const result = await quizApi.getReview(supabase, attemptId);
  if (!result || result.attempt.user_id !== user.id) notFound();

  const { attempt, items } = result;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Kết quả quiz
        </h1>
        <p className="text-primary text-5xl font-bold tracking-tight">{attempt.score ?? 0}%</p>
        <p className="text-muted-foreground">
          Đúng {attempt.correct_count ?? 0}/{attempt.total_questions ?? items.length} câu
        </p>
        <Link href={ROUTES.QUIZ} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}>
          Làm quiz mới
        </Link>
      </header>

      <section className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="gap-2">
              <div className="flex items-start gap-2">
                {item.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
                )}
                <p className="font-medium whitespace-pre-wrap">
                  Câu {index + 1}. {item.prompt_md}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.code_snippet ? (
                <pre className="bg-muted overflow-x-auto rounded-md border p-3 text-sm">
                  <code>{item.code_snippet}</code>
                </pre>
              ) : null}
              {item.options.map((opt) => {
                const isCorrect = item.correctKeys.includes(opt.key);
                const isSelected = item.selectedKeys.includes(opt.key);
                return (
                  <div
                    key={opt.key}
                    className={cn(
                      "rounded-lg border p-2.5 text-sm",
                      isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                      isSelected && !isCorrect && "border-rose-500/50 bg-rose-500/10",
                    )}
                  >
                    <span className="font-medium">{opt.key.toUpperCase()}.</span> {opt.text}
                    {isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400"> · đáp án đúng</span>
                    ) : null}
                    {isSelected && !isCorrect ? (
                      <span className="text-rose-600 dark:text-rose-400"> · bạn chọn</span>
                    ) : null}
                  </div>
                );
              })}
              {item.answer_md ? (
                <div className="text-muted-foreground mt-1 border-t pt-2 text-sm whitespace-pre-wrap">
                  {item.answer_md}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
