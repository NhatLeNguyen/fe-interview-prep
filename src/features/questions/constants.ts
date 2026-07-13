import type { QuestionSort } from "./types";

/** Tên tham số URL cho bộ lọc (đồng bộ URL để share/bookmark link). */
export const QUESTION_PARAM = {
  search: "q",
  level: "level",
  type: "type",
  category: "category",
  topic: "topic",
  sort: "sort",
} as const;

/** Sentinel cho lựa chọn "Tất cả" trong Select (không đưa vào URL). */
export const ALL_VALUE = "all";

export const DEFAULT_SORT: QuestionSort = "popular";

export const QUESTION_SORTS: { value: QuestionSort; label: string }[] = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "difficulty-asc", label: "Dễ → Khó" },
  { value: "difficulty-desc", label: "Khó → Dễ" },
  { value: "newest", label: "Mới nhất" },
];
