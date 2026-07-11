import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { LEVEL_LABELS, type Level } from "@/constants/taxonomy";

const LEVEL_STYLES: Record<Level, string> = {
  junior:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  mid: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  senior:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <Badge variant="outline" className={cn(LEVEL_STYLES[level], className)}>
      {LEVEL_LABELS[level]}
    </Badge>
  );
}
