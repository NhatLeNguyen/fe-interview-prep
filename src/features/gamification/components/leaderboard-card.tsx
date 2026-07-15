import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/cn";
import type { LeaderboardRow } from "../types";

export function LeaderboardCard({
  rows,
  myRank,
}: {
  rows: LeaderboardRow[];
  myRank: number | null;
}) {
  const meInTop = myRank != null && rows.some((r) => r.rank === myRank);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bảng xếp hạng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-muted-foreground mb-2 text-xs">
          Ẩn danh — chỉ hiện thứ hạng và XP, không lộ danh tính.
        </p>

        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">Chưa có dữ liệu xếp hạng.</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.rank}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
                myRank === r.rank && "bg-primary/10 font-medium",
              )}
            >
              <span className="tabular-nums">
                #{r.rank}
                {myRank === r.rank ? " · Bạn" : ""}
              </span>
              <span className="tabular-nums">{r.xp} XP</span>
            </div>
          ))
        )}

        {myRank != null && !meInTop ? (
          <div className="bg-primary/10 mt-2 flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium">
            <span className="tabular-nums">#{myRank} · Bạn</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
