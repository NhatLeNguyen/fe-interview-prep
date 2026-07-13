import { FileQuestion, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { QUESTION_TYPE_LABELS } from "@/constants/taxonomy";
import { ROUTES } from "@/constants/routes";
import { adminApi, QuestionRowActions } from "@/features/admin";
import { truncate } from "@/helpers/string";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Câu hỏi" };

export default async function AdminQuestionsPage() {
  const supabase = await createClient();
  const questions = await adminApi.listQuestions(supabase);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý câu hỏi</h1>
          <p className="text-muted-foreground mt-1">{questions.length} câu hỏi</p>
        </div>
        <Link href={ROUTES.ADMIN_QUESTION_NEW} className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" />
          Thêm
        </Link>
      </header>

      {questions.length === 0 ? (
        <EmptyState icon={FileQuestion} title="Chưa có câu hỏi nào" description="Bấm “Thêm” để tạo câu hỏi đầu tiên." />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
              <tr>
                <th className="p-3 font-medium">Đề bài</th>
                <th className="p-3 font-medium">Chủ đề</th>
                <th className="p-3 font-medium">Dạng</th>
                <th className="p-3 font-medium">Publish</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="p-3">
                    <Link
                      href={ROUTES.ADMIN_QUESTION_EDIT(q.id)}
                      className="hover:text-primary font-medium hover:underline"
                    >
                      {truncate(q.prompt_md.replace(/[#*`>_]/g, ""), 68)}
                    </Link>
                  </td>
                  <td className="text-muted-foreground p-3">{q.topic?.name ?? "—"}</td>
                  <td className="text-muted-foreground p-3">{QUESTION_TYPE_LABELS[q.type]}</td>
                  <td className="p-3">
                    {q.is_published ? (
                      <Badge variant="secondary" className="font-normal">
                        Có
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground font-normal">
                        Ẩn
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <QuestionRowActions id={q.id} isPublished={q.is_published} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
