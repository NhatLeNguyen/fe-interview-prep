import { Award, BookOpen, Code, Flame, ListChecks, Star, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import type { BadgeState } from "../types";

/** Map tên icon (cột badges.icon) -> component lucide. */
const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  "book-open": BookOpen,
  "list-checks": ListChecks,
  code: Code,
  star: Star,
  award: Award,
};

export function BadgeGrid({ badges }: { badges: BadgeState[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((b) => {
        const Icon = ICONS[b.icon] ?? Award;
        const pct = Math.min(100, Math.round((b.progress / b.threshold) * 100));
        return (
          <div
            key={b.id}
            className={cn(
              "rounded-xl border p-3",
              b.earned ? "border-amber-500/40 bg-amber-500/5" : "opacity-70",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  b.earned
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{b.name}</p>
                <p className="text-muted-foreground text-xs">{b.description}</p>
                {b.earned ? (
                  <p className="mt-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    Đã đạt
                  </p>
                ) : (
                  <div className="mt-2 space-y-1">
                    <div className="bg-muted h-1 overflow-hidden rounded-full">
                      <div
                        className="bg-muted-foreground/40 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-[10px] tabular-nums">
                      {Math.min(b.progress, b.threshold)}/{b.threshold}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
