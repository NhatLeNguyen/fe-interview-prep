import { Bookmark } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { QuestionCard, questionsApi } from "@/features/questions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Câu hỏi đã lưu" };

export default async function BookmarksPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  const questions = await questionsApi.listBookmarked(supabase, user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Câu hỏi đã lưu</h1>
        <p className="text-muted-foreground mt-1">
          {questions.length > 0
            ? `${questions.length} câu hỏi bạn đã bookmark.`
            : "Những câu hỏi bạn lưu lại sẽ xuất hiện ở đây."}
        </p>
      </header>

      {questions.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Chưa lưu câu hỏi nào"
          description="Bấm nút “Lưu” ở trang chi tiết câu hỏi để thêm vào đây."
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
