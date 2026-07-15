import { Card, CardContent } from "@/components/ui/card";

import { xpToLevel } from "../helpers/level";

export function XpCard({ xp, rank }: { xp: number; rank: number | null }) {
  const { level, current, needed, pct } = xpToLevel(xp);

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs">Cấp độ</p>
            <p className="text-3xl leading-none font-bold">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Tổng XP</p>
            <p className="text-xl font-semibold tabular-nums">{xp}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-muted-foreground flex justify-between text-xs">
            <span className="tabular-nums">
              {current}/{needed} XP tới cấp {level + 1}
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {rank ? (
          <p className="text-muted-foreground text-xs">
            Hạng của bạn: <span className="text-foreground font-medium tabular-nums">#{rank}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
