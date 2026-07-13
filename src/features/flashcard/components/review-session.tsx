"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { gradeCard } from "../actions";
import { REVIEW_GRADES, type ReviewGradeTone } from "../constants";
import type { ReviewCard } from "../types";

const TONE_CLASS: Record<ReviewGradeTone, string> = {
  danger: "border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
  warn: "border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
  default: "",
  good: "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400",
};

export function ReviewSession({ initialCards }: { initialCards: ReviewCard[] }) {
  const [queue, setQueue] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const card = queue[index];

  if (!card) {
    return (
      <div className="space-y-2 py-16 text-center">
        <p className="text-lg font-medium">Hoàn thành! 🎉</p>
        <p className="text-muted-foreground">Bạn đã ôn {done} lượt trong phiên này.</p>
      </div>
    );
  }

  const grade = (value: number) => {
    setError(false);
    startTransition(async () => {
      try {
        await gradeCard(card.id, value);
        setDone((d) => d + 1);
        setRevealed(false);
        // "Quên" (grade < 3): đưa thẻ xuống cuối hàng đợi để học lại trong phiên.
        if (value < 3) setQueue((q) => [...q, card]);
        setIndex((i) => i + 1);
      } catch {
        setError(true); // giữ nguyên thẻ để thử lại
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>Còn {queue.length - index} thẻ</span>
        <span>{done} đã ôn</span>
      </div>

      <Card className="min-h-64">
        <CardHeader className="gap-2">
          <p className="text-muted-foreground font-mono text-xs">Câu hỏi</p>
          <p className="text-lg font-medium whitespace-pre-wrap">{card.prompt_md}</p>
        </CardHeader>
        <CardContent>
          {revealed ? (
            <div className="space-y-2 border-t pt-3">
              {card.code_snippet ? (
                <pre className="bg-muted overflow-x-auto rounded-md border p-3 text-sm">
                  <code>{card.code_snippet}</code>
                </pre>
              ) : null}
              <div className="text-foreground/90 text-sm whitespace-pre-wrap">
                {card.answer_md ?? "—"}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-destructive text-center text-sm">
          Không lưu được kết quả, vui lòng thử lại.
        </p>
      ) : null}

      {revealed ? (
        <div className="grid grid-cols-4 gap-2">
          {REVIEW_GRADES.map((g) => (
            <Button
              key={g.grade}
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => grade(g.grade)}
              className={cn("h-auto flex-col gap-0.5 py-2", TONE_CLASS[g.tone])}
            >
              <span className="font-medium">{g.label}</span>
              <span className="text-[0.7rem] opacity-70">{g.hint}</span>
            </Button>
          ))}
        </div>
      ) : (
        <Button type="button" className="w-full" onClick={() => setRevealed(true)}>
          Hiện đáp án
        </Button>
      )}
    </div>
  );
}
