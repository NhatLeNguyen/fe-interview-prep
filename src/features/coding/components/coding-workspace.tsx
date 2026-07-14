"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { runSolution, submitSolution } from "../actions";
import { RUN_COOLDOWN_MS } from "../constants";
import type { CodingProblemDetail, GradeResult } from "../types";
import { CodeEditor } from "./code-editor";
import { ResultPanel } from "./result-panel";

/** Bỏ ký tự markdown thô để hiển thị prompt dạng text (khớp cách app render câu hỏi). */
function plainPrompt(md: string): string {
  return md.replace(/[#*`>_]/g, "");
}

export function CodingWorkspace({
  problem,
  isAuthenticated,
}: {
  problem: CodingProblemDetail;
  isAuthenticated: boolean;
}) {
  const [code, setCode] = useState(problem.starterCode);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [cooling, setCooling] = useState(false);
  const coolTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (coolTimer.current) clearTimeout(coolTimer.current);
  }, []);

  const disabled = pending || cooling;

  const act = (fn: (id: string, code: string) => Promise<GradeResult>) => {
    if (!isAuthenticated || disabled) return;
    setCooling(true);
    startTransition(async () => {
      try {
        setResult(await fn(problem.id, code));
      } finally {
        coolTimer.current = setTimeout(() => setCooling(false), RUN_COOLDOWN_MS);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="text-sm whitespace-pre-wrap">{plainPrompt(problem.promptMd)}</div>
        {problem.samples.length > 0 ? (
          <div>
            <h2 className="mb-2 text-sm font-medium">Ví dụ</h2>
            <ul className="space-y-1.5">
              {problem.samples.map((s, i) => (
                <li key={i} className="rounded-md border p-2 font-mono text-xs">
                  <div>
                    <span className="text-muted-foreground">input:</span> {JSON.stringify(s.args)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">expected:</span>{" "}
                    {JSON.stringify(s.expected)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-xs">
          Viết hàm <code className="font-mono">{problem.functionName}</code> (JavaScript).
        </p>
        <CodeEditor value={code} onChange={setCode} />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!isAuthenticated || disabled}
            onClick={() => act(runSolution)}
          >
            {pending ? "Đang chạy…" : "Chạy"}
          </Button>
          <Button
            type="button"
            disabled={!isAuthenticated || disabled}
            onClick={() => act(submitSolution)}
          >
            Nộp bài
          </Button>
          {!isAuthenticated ? (
            <Link
              href={ROUTES.LOGIN}
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              Đăng nhập để chạy
            </Link>
          ) : null}
        </div>
        <ResultPanel result={result} pending={pending} />
      </div>
    </div>
  );
}
