import type { Enums, Tables } from "@/types/db";

export type QuestionLevel = Enums<"level">;
export type QuestionKind = Enums<"question_type">;

/** Cách sắp xếp danh sách câu hỏi. */
export type QuestionSort = "popular" | "difficulty-asc" | "difficulty-desc" | "newest";

/** Category rút gọn (nhúng qua topic). */
export interface QuestionCategoryRef {
  name: string;
  slug: string;
  color: string | null;
}

/** Topic rút gọn cho danh sách. */
export interface QuestionTopicRef {
  name: string;
  slug: string;
  category: QuestionCategoryRef | null;
}

/** 1 item trong danh sách ngân hàng câu hỏi. */
export interface QuestionListItem {
  id: string;
  slug: string;
  prompt_md: string;
  type: QuestionKind;
  level: QuestionLevel;
  difficulty: number;
  frequency: number;
  topic: QuestionTopicRef | null;
}

/** Chi tiết câu hỏi (đầy đủ cột + topic + tags). */
export type QuestionDetail = Tables<"questions"> & {
  topic: (QuestionTopicRef & { level: QuestionLevel }) | null;
  tags: { name: string; slug: string }[];
};

/** Option category cho bộ lọc. */
export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  color: string | null;
}

/** Bộ lọc (đã validate) truyền vào tầng api. Filter cộng dồn (AND). */
export interface QuestionFilters {
  search?: string;
  level?: QuestionLevel;
  type?: QuestionKind;
  categorySlug?: string;
  topicId?: string;
  topicSlug?: string;
  /** Lọc theo track (vd 'fe-interview') — tách nội dung cert khỏi FE. */
  trackSlug?: string;
  sort?: QuestionSort;
}
