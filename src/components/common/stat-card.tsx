import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, hint, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="text-muted-foreground truncate text-xs">
            {label}
            {hint ? <span className="opacity-70"> · {hint}</span> : null}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
