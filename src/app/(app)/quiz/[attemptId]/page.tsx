import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { QuizRunner, quizApi } from "@/features/quiz";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Đang làm quiz" };

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function QuizAttemptPage({ params }: PageProps) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  const attempt = await quizApi.getAttempt(supabase, attemptId);
  if (!attempt || attempt.user_id !== user.id) notFound();
  if (attempt.status === "completed") redirect(ROUTES.QUIZ_RESULT(attemptId));

  const questions = await quizApi.getRunnerQuestions(supabase, attempt.question_ids);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Làm bài</h1>
        <p className="text-muted-foreground mt-1">
          {questions.length} câu trắc nghiệm — chọn đáp án rồi nộp bài.
        </p>
      </header>
      <QuizRunner attemptId={attemptId} questions={questions} />
    </div>
  );
}
