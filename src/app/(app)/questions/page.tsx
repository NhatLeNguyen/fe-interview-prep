import { FileQuestion, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  hasActiveFilters,
  parseQuestionFilters,
  QuestionCard,
  QuestionFilterBar,
  questionsApi,
} from "@/features/questions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ngân hàng câu hỏi",
  description: "Tổng hợp câu hỏi phỏng vấn Front-end song ngữ Việt–Anh, từ junior đến senior.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  const filters = parseQuestionFilters(await searchParams);
  const filtered = hasActiveFilters(filters);

  const supabase = await createClient();
  // Ngân hàng câu hỏi FE: chỉ track fe-interview (không lẫn nội dung ôn thi chứng chỉ).
  const [questions, categories] = await Promise.all([
    questionsApi.list(supabase, { ...filters, trackSlug: "fe-interview" }),
    questionsApi.listCategories(supabase),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Ngân hàng câu hỏi</h1>
        <p className="text-muted-foreground mt-1">
          {filtered
            ? `${questions.length} câu hỏi khớp bộ lọc.`
            : "Tổng hợp câu hỏi phỏng vấn Front-end, từ junior đến senior."}
        </p>
      </header>

      <QuestionFilterBar categories={categories} />

      {questions.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy câu hỏi khớp bộ lọc"
            description="Thử bỏ bớt điều kiện hoặc từ khoá tìm kiếm."
          >
            <Link
              href={ROUTES.QUESTIONS}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Xoá bộ lọc
            </Link>
          </EmptyState>
        ) : (
          <EmptyState
            icon={FileQuestion}
            title="Chưa có câu hỏi nào"
            description="Chạy file supabase/seeds/01_content.sql trong SQL Editor để thêm câu hỏi mẫu."
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
