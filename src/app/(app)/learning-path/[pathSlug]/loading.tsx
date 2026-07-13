import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-40" />
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-12 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
