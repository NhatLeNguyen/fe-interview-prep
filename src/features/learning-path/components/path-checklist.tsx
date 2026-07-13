"use client";

import { Circle, CircleCheck, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { toggleItemComplete } from "../actions";
import type { PathModule } from "../types";

interface PathChecklistProps {
  pathId: string;
  slug: string;
  modules: PathModule[];
  isAuthenticated: boolean;
}

export function PathChecklist({ pathId, slug, modules, isAuthenticated }: PathChecklistProps) {
  const allItems = modules.flatMap((m) => m.items);
  const initial = () => new Set(allItems.filter((i) => i.completed).map((i) => i.id));
  const [done, setDone] = useState<Set<string>>(initial);
  // Nguồn sự thật đồng bộ: tránh race khi bấm nhanh (closure `done` bị stale).
  const doneRef = useRef(done);
  const [saveError, setSaveError] = useState(false);
  const [, startTransition] = useTransition();

  const total = allItems.length;
  const completed = done.size;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  // Mở khoá tuần tự: module i mở khi MỌI item bắt buộc của các module trước đã hoàn thành.
  const moduleUnlocked = modules.map((_, i) =>
    modules
      .slice(0, i)
      .every((m) => m.items.filter((it) => !it.isOptional).every((it) => done.has(it.id))),
  );
  // "Bước hiện tại" = module mở khoá đầu tiên vẫn còn item chưa hoàn thành.
  const currentStep = modules.findIndex(
    (m, i) => moduleUnlocked[i] && m.items.some((it) => !done.has(it.id)),
  );

  const apply = (next: boolean, itemId: string) => {
    const s = new Set(doneRef.current);
    if (next) s.add(itemId);
    else s.delete(itemId);
    doneRef.current = s;
    setDone(s);
  };

  const toggle = (itemId: string, moduleIndex: number) => {
    if (!isAuthenticated || !moduleUnlocked[moduleIndex]) return;
    const next = !doneRef.current.has(itemId);
    apply(next, itemId);
    setSaveError(false);
    startTransition(async () => {
      try {
        await toggleItemComplete(pathId, slug, itemId, next);
      } catch {
        apply(!next, itemId); // revert
        setSaveError(true);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Tiến độ</span>
          <span className="text-muted-foreground tabular-nums">
            {completed}/{total} · {pct}%
          </span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {!isAuthenticated ? (
          <p className="text-muted-foreground text-sm">
            <Link
              href={ROUTES.LOGIN}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Đăng nhập
            </Link>{" "}
            để lưu tiến độ học.
          </p>
        ) : null}
        {saveError ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            Không lưu được tiến độ. Kiểm tra kết nối và thử lại.
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        {modules.map((m, index) => {
          const unlocked = moduleUnlocked[index];
          const isCurrent = index === currentStep;
          return (
            <div key={`${m.title}-${index}`} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
                  Module {index + 1} · {m.title}
                </h2>
                {isCurrent ? (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                    Bước hiện tại
                  </span>
                ) : !unlocked ? (
                  <Lock className="text-muted-foreground size-3" />
                ) : null}
              </div>
              <ul className="space-y-1.5">
                {m.items.map((item) => {
                  const isDone = done.has(item.id);
                  const canToggle = isAuthenticated && unlocked;
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                        isDone
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : unlocked
                            ? "hover:bg-muted"
                            : "opacity-60",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(item.id, index)}
                        disabled={!canToggle}
                        aria-label={isDone ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"}
                        className={cn("shrink-0", canToggle ? "cursor-pointer" : "cursor-default")}
                      >
                        {isDone ? (
                          <CircleCheck className="size-5 text-emerald-500" />
                        ) : !unlocked ? (
                          <Lock className="text-muted-foreground size-5" />
                        ) : (
                          <Circle className="text-muted-foreground size-5" />
                        )}
                      </button>

                      {item.href && unlocked ? (
                        <Link
                          href={item.href}
                          className={cn(
                            "group inline-flex items-center gap-1.5 hover:underline",
                            isDone && "text-muted-foreground line-through",
                          )}
                        >
                          {item.title}
                          <ExternalLink className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                        </Link>
                      ) : (
                        <span className={cn(isDone && "text-muted-foreground line-through")}>
                          {item.title}
                        </span>
                      )}

                      {item.isOptional ? (
                        <span className="text-muted-foreground ml-auto text-xs">tuỳ chọn</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
