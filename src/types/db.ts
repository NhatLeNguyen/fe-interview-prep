import type { Database } from "@/lib/supabase/database.types";

/**
 * Alias tiện dụng trên generated DB types (nguồn chân lý = database.types.ts).
 * Đổi cột/bảng ở DB -> gen lại types -> tsc báo lỗi ngay tại nơi dùng.
 *
 * Ví dụ: `type Question = Tables<'questions'>`.
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
