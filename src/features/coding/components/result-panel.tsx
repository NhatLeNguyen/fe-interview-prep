"use client";

import { CircleCheck, CircleX, Loader2 } from "lucide-react";

import { cn } from "@/lib/cn";
import type { GradeResult } from "../types";

export function ResultPanel({ result, pending }: { result: GradeResult | null; pending: boolean }) {
  if (pending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Đang chạy…
      </div>
    );
  }
  if (!result) {
    return (
      <p className="text-muted-foreground text-sm">Bấm “Chạy” để kiểm tra với các ca mẫu.</p>
    );
  }

  if (result.status === "error") {
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm font-medium">Lỗi khi chạy</p>
        <pre className="bg-destructive/10 text-destructive overflow-x-auto rounded-md p-3 text-xs whitespace-pre-wrap">
          {result.message}
        </pre>
      </div>
    );
  }

  const samples = result.cases.filter((c) => c.isSample);
  const hidden = result.cases.filter((c) => !c.isSample);
  const hiddenPassed = hidden.filter((c) => c.pass).length;
  const passed = result.status === "passed";

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          passed
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-amber-600 dark:text-amber-400",
        )}
      >
        {passed ? <CircleCheck className="size-4" /> : <CircleX className="size-4" />}
        {passed ? "Đạt tất cả" : "Chưa đạt"} — {result.passedCount}/{result.totalCount} ca
      </div>

      <ul className="space-y-1.5">
        {samples.map((c) => (
          <li
            key={c.index}
            className={cn(
              "rounded-md border p-2 text-xs",
              c.pass ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5",
            )}
          >
            <div className="flex items-center gap-1.5 font-medium">
              {c.pass ? (
                <CircleCheck className="size-3.5 text-emerald-500" />
              ) : (
                <CircleX className="size-3.5 text-rose-500" />
              )}
              Ca mẫu #{c.index + 1}
            </div>
            {c.error ? (
              <p className="text-destructive mt-1 font-mono">{c.error}</p>
            ) : (
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 font-mono text-[11px]">
                <dt className="text-muted-foreground">input</dt>
                <dd className="overflow-x-auto">{JSON.stringify(c.args)}</dd>
                <dt className="text-muted-foreground">expected</dt>
                <dd className="overflow-x-auto">{JSON.stringify(c.expected)}</dd>
                <dt className="text-muted-foreground">got</dt>
                <dd
                  className={cn("overflow-x-auto", !c.pass && "text-rose-600 dark:text-rose-400")}
                >
                  {c.got}
                </dd>
              </dl>
            )}
          </li>
        ))}
      </ul>

      {hidden.length > 0 ? (
        <p className="text-muted-foreground text-xs">
          Ca ẩn: {hiddenPassed}/{hidden.length} đạt
        </p>
      ) : null}
    </div>
  );
}
