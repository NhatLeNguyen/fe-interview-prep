import { FileQuestion } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/common/empty-state";
import { QuestionCard, questionsApi } from "@/features/questions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ngân hàng câu hỏi",
  description: "Tổng hợp câu hỏi phỏng vấn Front-end song ngữ Việt–Anh, từ junior đến senior.",
};

export default async function QuestionsPage() {
  const supabase = await createClient();
  const questions = await questionsApi.list(supabase);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Ngân hàng câu hỏi</h1>
        <p className="text-muted-foreground mt-1">
          {questions.length > 0
            ? `${questions.length} câu hỏi phỏng vấn Front-end, sắp theo độ phổ biến.`
            : "Tổng hợp câu hỏi phỏng vấn Front-end, từ junior đến senior."}
        </p>
      </header>

      {questions.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="Chưa có câu hỏi nào"
          description="Chạy file supabase/seed-content.sql trong SQL Editor để thêm câu hỏi mẫu."
        />
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
