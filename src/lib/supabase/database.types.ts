/**
 * ⚠️ PLACEHOLDER — types tạm cho tới khi có DB thật.
 *
 * Sau khi chạy migrations lên Supabase, thay thế TOÀN BỘ file này bằng:
 *   npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 *
 * `Tables` để mở (Record) để feature code compile được trước khi gen types.
 * `Enums` đã điền đúng theo schema chuẩn docs/08 (R3) nên dùng an toàn ngay từ bây giờ.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type PlaceholderRow = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: Record<string, PlaceholderRow>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "user" | "admin";
      question_type: "theory" | "coding" | "quiz" | "system-design" | "behavioral";
      answer_format: "single_choice" | "multiple_choice" | "true_false";
      level: "junior" | "mid" | "senior";
      quiz_source: "preset" | "custom";
      attempt_status: "in_progress" | "completed" | "abandoned";
      progress_status: "not_started" | "in_progress" | "completed";
      path_item_type: "topic" | "quiz_set" | "question";
      flashcard_state: "new" | "learning" | "review" | "relearning";
      activity_type: "study" | "review" | "quiz" | "path";
    };
    CompositeTypes: Record<string, never>;
  };
};
