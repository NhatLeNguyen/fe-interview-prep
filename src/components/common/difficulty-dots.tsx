import { cn } from "@/lib/cn";
import { DIFFICULTY_SCALE } from "@/constants/taxonomy";

/** Hiển thị độ khó 1–5 dưới dạng chấm. */
export function DifficultyDots({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      title={`Độ khó ${value}/5`}
      aria-label={`Độ khó ${value} trên 5`}
    >
      {DIFFICULTY_SCALE.map((dot) => (
        <span
          key={dot}
          className={cn(
            "size-1.5 rounded-full",
            dot <= value ? "bg-foreground/70" : "bg-foreground/15",
          )}
        />
      ))}
    </span>
  );
}
