import type { Enums } from "@/types/db";

export interface DashboardData {
  streak: { current: number; longest: number };
  /** Số thẻ đến hạn ôn hôm nay. */
  dueToday: number;
  flashcards: {
    total: number;
    byState: Record<Enums<"flashcard_state">, number>;
  };
  quiz: {
    attempts: number;
    avgScore: number | null;
  };
}
