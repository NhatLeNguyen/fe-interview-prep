import { PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { flashcardApi, ReviewSession } from "@/features/flashcard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ôn tập hôm nay" };

export default async function ReviewPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  const cards = await flashcardApi.getDueCards(supabase, user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Ôn tập hôm nay</h1>
        <p className="text-muted-foreground mt-1">
          Ôn lại đúng lúc sắp quên (spaced repetition) — tự đánh giá để hệ thống lên lịch.
        </p>
      </header>

      {cards.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Hôm nay không có thẻ cần ôn 🎉"
          description="Thêm câu hỏi vào bộ ôn tập từ trang chi tiết (nút “Ôn tập”) để bắt đầu."
        >
          <Link
            href={ROUTES.QUESTIONS}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Duyệt câu hỏi
          </Link>
        </EmptyState>
      ) : (
        <ReviewSession initialCards={cards} />
      )}
    </div>
  );
}
