import { XP_PER_LEVEL } from "../constants";

export interface LevelInfo {
  level: number;
  /** XP đã tích trong level hiện tại. */
  current: number;
  /** XP cần để lên level kế. */
  needed: number;
  /** % tiến độ trong level hiện tại (0-100). */
  pct: number;
}

/** Quy đổi XP -> level (hàm THUẦN — không import React). XP âm/không hợp lệ coi như 0. */
export function xpToLevel(xp: number): LevelInfo {
  const safe = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  const level = Math.floor(safe / XP_PER_LEVEL) + 1;
  const current = safe % XP_PER_LEVEL;
  return {
    level,
    current,
    needed: XP_PER_LEVEL,
    pct: Math.round((current / XP_PER_LEVEL) * 100),
  };
}
