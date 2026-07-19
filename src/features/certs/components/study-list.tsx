import { AddFlashcardButton } from "@/features/flashcard";
import type { StudyItem } from "../types";

/** Bỏ ký tự markdown thô (khớp cách app render câu hỏi). */
const plain = (md: string) => md.replace(/[#*`>_]/g, "");

export function StudyList({
  items,
  isAuthenticated,
}: {
  items: StudyItem[];
  isAuthenticated: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">Phần này chưa có nội dung học.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <article key={it.id} className="space-y-2 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="leading-snug font-medium">{plain(it.promptMd)}</h3>
            <AddFlashcardButton
              questionId={it.id}
              initialAdded={false}
              isAuthenticated={isAuthenticated}
            />
          </div>
          {it.answerMd ? (
            <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
              {plain(it.answerMd)}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
