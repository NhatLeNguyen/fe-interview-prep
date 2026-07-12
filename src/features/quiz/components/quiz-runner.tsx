"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { submitQuiz } from "../actions";
import type { QuizSelection, RunnerQuestion } from "../types";

export function QuizRunner({
  attemptId,
  questions,
}: {
  attemptId: string;
  questions: RunnerQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const toggle = (q: RunnerQuestion, key: string) => {
    setAnswers((prev) => {
      const multi = q.answer_format === "multiple_choice";
      if (!multi) return { ...prev, [q.id]: [key] };
      const current = new Set(prev[q.id] ?? []);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, [q.id]: [...current] };
    });
  };

  const answeredCount = questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;

  const onSubmit = () => {
    const selections: QuizSelection[] = questions.map((q) => ({
      questionId: q.id,
      selectedKeys: answers[q.id] ?? [],
    }));
    startTransition(async () => {
      await submitQuiz(attemptId, selections);
    });
  };

  return (
    <div className="space-y-5">
      {questions.map((q, index) => (
        <Card key={q.id}>
          <CardHeader className="gap-2">
            <p className="text-muted-foreground font-mono text-xs">
              Câu {index + 1}/{questions.length}
            </p>
            <p className="font-medium whitespace-pre-wrap">{q.prompt_md}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.code_snippet ? (
              <pre className="bg-muted overflow-x-auto rounded-md border p-3 text-sm">
                <code>{q.code_snippet}</code>
              </pre>
            ) : null}
            {q.options.map((opt) => {
              const selected = (answers[q.id] ?? []).includes(opt.key);
              return (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => toggle(q, opt.key)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                    selected ? "border-primary bg-primary/5" : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      selected && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {opt.key.toUpperCase()}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <div className="bg-background/80 sticky bottom-0 flex items-center justify-between border-t py-3 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">
          Đã trả lời {answeredCount}/{questions.length}
        </p>
        <Button onClick={onSubmit} disabled={pending || answeredCount === 0}>
          {pending ? "Đang chấm…" : "Nộp bài"}
        </Button>
      </div>
    </div>
  );
}
