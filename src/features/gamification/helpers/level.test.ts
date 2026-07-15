import { describe, expect, it } from "vitest";

import { xpToLevel } from "./level";

describe("xpToLevel", () => {
  it("0 XP -> level 1, 0%", () => {
    expect(xpToLevel(0)).toEqual({ level: 1, current: 0, needed: 100, pct: 0 });
  });

  it("giữa level", () => {
    expect(xpToLevel(150)).toEqual({ level: 2, current: 50, needed: 100, pct: 50 });
  });

  it("đúng mốc lên level", () => {
    expect(xpToLevel(100).level).toBe(2);
    expect(xpToLevel(100).current).toBe(0);
    expect(xpToLevel(999).level).toBe(10);
  });

  it("giá trị không hợp lệ -> coi như 0", () => {
    expect(xpToLevel(-50).level).toBe(1);
    expect(xpToLevel(Number.NaN).level).toBe(1);
  });
});
