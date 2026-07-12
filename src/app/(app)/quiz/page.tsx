import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { questionsApi } from "@/features/questions";
import { CustomQuizBuilder } from "@/features/quiz";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quiz" };

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function QuizPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const categories = await questionsApi.listCategories(supabase);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Quiz trắc nghiệm</h1>
        <p className="text-muted-foreground mt-1">
          Tự tạo bộ đề theo chủ đề & cấp độ, chấm điểm tức thì kèm giải thích.
        </p>
      </header>

      {error ? (
        <p role="alert" className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {error === "empty"
            ? "Không đủ câu hỏi trắc nghiệm cho bộ lọc này. Thử bỏ bớt điều kiện, hoặc chạy seed nội dung."
            : error === "submit"
              ? "Có lỗi khi nộp bài, vui lòng thử lại."
              : "Có lỗi khi tạo đề, vui lòng thử lại."}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tạo bộ đề</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomQuizBuilder categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
