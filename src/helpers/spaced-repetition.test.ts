import { describe, expect, it } from "vitest";

import { MIN_EASE_FACTOR, NEW_CARD, reviewCard, type SrsState } from "./spaced-repetition";

const NOW = new Date("2026-07-12T00:00:00Z");

describe("reviewCard (SM-2)", () => {
  it("grade < 3: về relearning, GIỮ NGUYÊN easeFactor (không decay)", () => {
    const prev: SrsState = {
      state: "review",
      easeFactor: 2.5,
      intervalDays: 10,
      repetitions: 3,
    };
    const result = reviewCard(prev, 1, NOW);
    expect(result.state).toBe("relearning");
    expect(result.easeFactor).toBe(2.5);
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it("lần ôn thành công đầu tiên: interval = 1 ngày", () => {
    const result = reviewCard(NEW_CARD, 4, NOW);
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.state).toBe("review");
  });

  it("lần ôn thành công thứ hai: interval = 6 ngày", () => {
    const prev: SrsState = { ...NEW_CARD, repetitions: 1, intervalDays: 1 };
    const result = reviewCard(prev, 4, NOW);
    expect(result.intervalDays).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it("interval sau đó nhân theo easeFactor", () => {
    const prev: SrsState = { state: "review", easeFactor: 2.0, intervalDays: 6, repetitions: 2 };
    const result = reviewCard(prev, 5, NOW);
    expect(result.intervalDays).toBe(12); // round(6 * 2.0)
  });

  it("easeFactor không xuống dưới sàn 1.3", () => {
    const prev: SrsState = { state: "review", easeFactor: 1.3, intervalDays: 6, repetitions: 2 };
    const result = reviewCard(prev, 3, NOW);
    expect(result.easeFactor).toBeGreaterThanOrEqual(MIN_EASE_FACTOR);
  });

  it("due_at = now + interval", () => {
    const result = reviewCard(NEW_CARD, 4, NOW);
    expect(result.dueAt.getTime()).toBe(NOW.getTime() + 1 * 86_400_000);
  });
});
