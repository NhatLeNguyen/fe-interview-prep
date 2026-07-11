/** Hàm THUẦN xử lý ngày tháng — không import React, không side-effect ngoài input. */

export const MS_PER_DAY = 86_400_000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Số ngày (làm tròn xuống) giữa 2 mốc, theo UTC-day. */
export function diffInDays(from: Date, to: Date): number {
  return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** Thẻ đã "đến hạn" ôn khi due <= now. */
export function isDue(dueAt: Date, now: Date): boolean {
  return dueAt.getTime() <= now.getTime();
}

/** Định dạng tương đối tiếng Việt: "hôm nay", "3 ngày trước", "trong 2 ngày". */
export function formatRelativeDay(target: Date, now: Date): string {
  const days = diffInDays(now, target);
  if (days === 0) return "hôm nay";
  if (days === 1) return "ngày mai";
  if (days === -1) return "hôm qua";
  return days > 0 ? `trong ${days} ngày` : `${Math.abs(days)} ngày trước`;
}
