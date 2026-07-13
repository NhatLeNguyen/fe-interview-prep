import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { adminApi, QuestionForm } from "@/features/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Thêm câu hỏi" };

export default async function NewQuestionPage() {
  const supabase = await createClient();
  const topics = await adminApi.listTopics(supabase);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={ROUTES.ADMIN_QUESTIONS}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Danh sách câu hỏi
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Thêm câu hỏi</h1>
      <QuestionForm topics={topics} />
    </div>
  );
}
