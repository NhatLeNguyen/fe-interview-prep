"use client";

import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { finishInterview, saveAnswer } from "../actions";
import { RATING_LABELS, RATING_SCALE } from "../constants";
import type { InterviewQuestionItem, InterviewSessionDetail } from "../types";

/** Bỏ ký tự markdown thô (khớp cách app render câu hỏi). */
const plain = (md: string) => md.replace(/[#*`>_]/g, "");

function QuestionCard({
  sessionId,
  item,
  index,
  total,
  onSaved,
}: {
  sessionId: string;
  item: InterviewQuestionItem;
  index: number;
  total: number;
  onSaved: () => void;
}) {
  const [text, setText] = useState(item.answerText ?? "");
  const [rating, setRating] = useState<number | null>(item.selfRating);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (rating == null) return;
    setError(false);
    startTransition(async () => {
      try {
        await saveAnswer(sessionId, item.questionId, text, rating);
        onSaved();
      } catch {
        setError(true);
      }
    });
  };

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>
          Câu {index + 1}/{total}
          {item.topicName ? ` · ${item.topicName}` : ""}
        </span>
        {item.selfRating != null ? (
          <span className="text-emerald-600 dark:text-emerald-400">Đã trả lời</span>
        ) : null}
      </div>

      <p className="leading-relaxed font-medium">{plain(item.promptMd)}</p>

      <div className="space-y-2">
        <label htmlFor="answer" className="text-sm font-medium">
          Câu trả lời của bạn
        </label>
        <textarea
          id="answer"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Trả lời như khi phỏng vấn thật…"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
        />
      </div>

      <div className="space-y-2">
        {revealed ? (
          <div className="bg-muted/50 space-y-1 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Đáp án tham khảo
            </p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {item.answerMd ? plain(item.answerMd) : "Câu này chưa có đáp án mẫu."}
            </div>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setRevealed(true)}>
            <Eye className="size-4" />
            Xem đáp án mẫu
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Tự chấm</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {RATING_SCALE.map((r) => (
            <Button
              key={r}
              type="button"
              variant="outline"
              onClick={() => setRating(r)}
              className={cn(
                "h-auto flex-col gap-0.5 py-2 whitespace-normal",
                rating === r && "border-primary bg-primary/10",
              )}
            >
              <span className="font-semibold">{r}</span>
              <span className="text-center text-[0.7rem] opacity-70">{RATING_LABELS[r]}</span>
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          Không lưu được, vui lòng thử lại.
        </p>
      ) : null}

      <Button type="button" onClick={save} disabled={rating == null || pending}>
        {pending ? "Đang lưu…" : "Lưu câu trả lời"}
      </Button>
    </div>
  );
}

export function InterviewRunner({ session }: { session: InterviewSessionDetail }) {
  const items = session.items;
  const firstUnanswered = items.findIndex((i) => i.selfRating == null);
  const [idx, setIdx] = useState(firstUnanswered === -1 ? 0 : firstUnanswered);
  const [pending, startTransition] = useTransition();
  const [finishError, setFinishError] = useState(false);
  const router = useRouter();

  const answered = items.filter((i) => i.selfRating != null).length;
  const allAnswered = answered === items.length && items.length > 0;
  const item = items[idx];
  const pct = items.length ? Math.round((answered / items.length) * 100) : 0;

  const onSaved = () => {
    if (idx < items.length - 1) setIdx((i) => i + 1);
    router.refresh();
  };

  const finish = () => {
    setFinishError(false);
    startTransition(async () => {
      try {
        await finishInterview(session.id);
        router.refresh();
      } catch {
        setFinishError(true);
      }
    });
  };

  if (!item) return <p className="text-muted-foreground text-sm">Phiên chưa có câu hỏi.</p>;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-muted-foreground flex justify-between text-xs">
          <span className="tabular-nums">
            Đã trả lời {answered}/{items.length}
          </span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <QuestionCard
        key={item.questionId}
        sessionId={session.id}
        item={item}
        index={idx}
        total={items.length}
        onSaved={onSaved}
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="size-4" />
          Câu trước
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={idx >= items.length - 1}
          onClick={() => setIdx((i) => Math.min(items.length - 1, i + 1))}
        >
          Câu sau
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {allAnswered ? (
        <div className="space-y-2">
          <Button type="button" className="w-full" onClick={finish} disabled={pending}>
            {pending ? "Đang tổng kết…" : "Kết thúc & xem tổng kết"}
          </Button>
          {finishError ? (
            <p role="alert" className="text-destructive text-center text-sm">
              Không kết thúc được phiên, vui lòng thử lại.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
