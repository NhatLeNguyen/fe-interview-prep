import { ListChecks } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { startCustomQuiz } from "@/features/quiz";
import { cn } from "@/lib/cn";

/**
 * Nút "Làm quiz" cho nội dung cert — tái dùng nguyên action startCustomQuiz
 * (bốc câu type='quiz' theo track + domain/topic). Là <form> nên chạy cả khi không JS.
 */
export function CertQuizButton({
  trackSlug,
  categorySlug,
  topicSlug,
  label = "Làm quiz phần này",
  count = 10,
  variant = "outline",
}: {
  trackSlug: string;
  categorySlug?: string;
  topicSlug?: string;
  label?: string;
  count?: number;
  variant?: "default" | "outline";
}) {
  return (
    <form action={startCustomQuiz}>
      <input type="hidden" name="track" value={trackSlug} />
      {categorySlug ? <input type="hidden" name="category" value={categorySlug} /> : null}
      {topicSlug ? <input type="hidden" name="topic" value={topicSlug} /> : null}
      <input type="hidden" name="count" value={String(count)} />
      <button type="submit" className={cn(buttonVariants({ variant, size: "sm" }))}>
        <ListChecks className="size-4" />
        {label}
      </button>
    </form>
  );
}
