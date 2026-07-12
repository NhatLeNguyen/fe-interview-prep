import { describe, expect, it } from "vitest";

import { hasActiveFilters, parseQuestionFilters } from "./filters";

describe("parseQuestionFilters", () => {
  it("giữ nguyên các giá trị hợp lệ", () => {
    const filters = parseQuestionFilters({
      q: "closure",
      level: "junior",
      type: "coding",
      category: "javascript",
      sort: "newest",
    });
    expect(filters).toEqual({
      search: "closure",
      level: "junior",
      type: "coding",
      categorySlug: "javascript",
      sort: "newest",
    });
  });

  it("bỏ qua level/type không thuộc taxonomy", () => {
    const filters = parseQuestionFilters({ level: "principal", type: "essay" });
    expect(filters.level).toBeUndefined();
    expect(filters.type).toBeUndefined();
  });

  it("sort lạ -> về mặc định 'popular'", () => {
    expect(parseQuestionFilters({ sort: "random" }).sort).toBe("popular");
    expect(parseQuestionFilters({}).sort).toBe("popular");
  });

  it("trim khoảng trắng và bỏ chuỗi rỗng", () => {
    expect(parseQuestionFilters({ q: "   " }).search).toBeUndefined();
    expect(parseQuestionFilters({ q: "  closure  " }).search).toBe("closure");
  });

  it("nếu param là mảng thì lấy phần tử đầu", () => {
    expect(parseQuestionFilters({ level: ["junior", "senior"] }).level).toBe("junior");
  });
});

describe("hasActiveFilters", () => {
  it("false khi chỉ có sort (không tính là lọc)", () => {
    expect(hasActiveFilters({ sort: "popular" })).toBe(false);
    expect(hasActiveFilters({})).toBe(false);
  });

  it("true khi có search/level/type/category", () => {
    expect(hasActiveFilters({ search: "x" })).toBe(true);
    expect(hasActiveFilters({ level: "mid" })).toBe(true);
    expect(hasActiveFilters({ type: "quiz" })).toBe(true);
    expect(hasActiveFilters({ categorySlug: "css" })).toBe(true);
  });
});
