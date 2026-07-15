import { describe, expect, it } from "vitest";

import type { UserStats } from "../types";
import { meetsCriteria, statValue } from "./criteria";

const stats: UserStats = { xp: 250, streak: 5, study: 12, quiz: 3, codingSolved: 2 };

describe("statValue", () => {
  it("map đúng từng tiêu chí", () => {
    expect(statValue(stats, "xp")).toBe(250);
    expect(statValue(stats, "streak")).toBe(5);
    expect(statValue(stats, "study")).toBe(12);
    expect(statValue(stats, "quiz")).toBe(3);
    expect(statValue(stats, "coding_solved")).toBe(2);
  });
});

describe("meetsCriteria", () => {
  it("đạt khi >= ngưỡng", () => {
    expect(meetsCriteria(stats, "streak", 5)).toBe(true);
    expect(meetsCriteria(stats, "streak", 3)).toBe(true);
    expect(meetsCriteria(stats, "xp", 100)).toBe(true);
  });
  it("chưa đạt khi < ngưỡng", () => {
    expect(meetsCriteria(stats, "streak", 7)).toBe(false);
    expect(meetsCriteria(stats, "quiz", 5)).toBe(false);
    expect(meetsCriteria(stats, "coding_solved", 5)).toBe(false);
  });
});
