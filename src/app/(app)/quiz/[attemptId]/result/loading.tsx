import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-2 py-4">
        <Skeleton className="h-16 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
