import { LEVELS, QUESTION_TYPES } from "@/constants/taxonomy";
import { DEFAULT_SORT, QUESTION_SORTS } from "../constants";
import type { QuestionFilters, QuestionKind, QuestionLevel, QuestionSort } from "../types";

// Hàm THUẦN: parse/validate tham số URL. KHÔNG import React.

const LEVEL_SET = new Set<string>(LEVELS);
const TYPE_SET = new Set<string>(QUESTION_TYPES);
const SORT_SET = new Set<string>(QUESTION_SORTS.map((s) => s.value));

/** Tham số URL thô (searchParams) — giá trị có thể là string | string[] | undefined. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  const trimmed = v?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Parse searchParams -> QuestionFilters đã validate.
 * Giá trị không hợp lệ (level/type/sort lạ) bị bỏ qua thay vì gây lỗi.
 */
export function parseQuestionFilters(raw: RawSearchParams): QuestionFilters {
  const level = first(raw.level);
  const type = first(raw.type);
  const sort = first(raw.sort);

  return {
    search: first(raw.q),
    level: level && LEVEL_SET.has(level) ? (level as QuestionLevel) : undefined,
    type: type && TYPE_SET.has(type) ? (type as QuestionKind) : undefined,
    categorySlug: first(raw.category),
    sort: sort && SORT_SET.has(sort) ? (sort as QuestionSort) : DEFAULT_SORT,
  };
}

/** Có bộ lọc nào đang active không (bỏ qua sort) — để hiện nút "Xoá bộ lọc" & empty-state phù hợp. */
export function hasActiveFilters(filters: QuestionFilters): boolean {
  return Boolean(filters.search || filters.level || filters.type || filters.categorySlug);
}
