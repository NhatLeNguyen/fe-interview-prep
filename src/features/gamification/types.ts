export type BadgeCriteria = "streak" | "study" | "quiz" | "coding_solved" | "xp";

/** Định nghĩa badge (công khai). */
export interface BadgeDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteriaType: BadgeCriteria;
  threshold: number;
}

/** Badge kèm trạng thái của user. */
export interface BadgeState extends BadgeDef {
  earned: boolean;
  earnedAt: string | null;
  /** Giá trị hiện tại theo criteria (để hiện tiến độ). */
  progress: number;
}

/** Số liệu dùng để xét badge + hiển thị. */
export interface UserStats {
  xp: number;
  streak: number;
  study: number;
  quiz: number;
  codingSolved: number;
}

/** 1 dòng bảng xếp hạng — ẨN DANH (không có danh tính). */
export interface LeaderboardRow {
  rank: number;
  xp: number;
}
