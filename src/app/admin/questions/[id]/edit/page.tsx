import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { adminApi, QuestionForm } from "@/features/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sửa câu hỏi" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [topics, question] = await Promise.all([
    adminApi.listTopics(supabase),
    adminApi.getQuestion(supabase, id),
  ]);
  if (!question) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={ROUTES.ADMIN_QUESTIONS}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Danh sách câu hỏi
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Sửa câu hỏi</h1>
      <QuestionForm topics={topics} question={question} />
    </div>
  );
}
