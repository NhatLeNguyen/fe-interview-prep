import { describe, expect, it } from "vitest";

import { selfScore } from "./score";

describe("selfScore", () => {
  it("toàn 5 -> 100%", () => expect(selfScore([5, 5, 5])).toBe(100));
  it("toàn 1 -> 20%", () => expect(selfScore([1, 1])).toBe(20));
  it("trung bình", () => expect(selfScore([3, 4])).toBe(70)); // avg 3.5 -> 70%
  it("bỏ qua giá trị không hợp lệ", () => {
    expect(selfScore([5, null, undefined, 0, 9])).toBe(100); // chỉ 5 hợp lệ
  });
  it("không có mức hợp lệ -> 0", () => {
    expect(selfScore([])).toBe(0);
    expect(selfScore([null, undefined])).toBe(0);
  });
});
