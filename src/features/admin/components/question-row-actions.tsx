"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteQuestion, togglePublish } from "../actions";

export function QuestionRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          title={isPublished ? "Ẩn (unpublish)" : "Publish"}
          aria-label={isPublished ? "Ẩn câu hỏi" : "Publish câu hỏi"}
          onClick={() => run(() => togglePublish(id, !isPublished))}
        >
          {isPublished ? <Eye className="size-4" /> : <EyeOff className="size-4 opacity-50" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          title="Xoá mềm"
          aria-label="Xoá câu hỏi"
          onClick={() => {
            if (window.confirm("Xoá câu hỏi này? (xoá mềm, có thể khôi phục ở DB)")) {
              run(() => deleteQuestion(id));
            }
          }}
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      </div>
      {error ? <span className="text-destructive text-xs whitespace-nowrap">{error}</span> : null}
    </div>
  );
}
