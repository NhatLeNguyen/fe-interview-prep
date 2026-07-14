import { describe, expect, it } from "vitest";

import { deepEqual } from "./deep-equal";

describe("deepEqual", () => {
  it("primitives", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("a", "a")).toBe(true);
    expect(deepEqual(true, false)).toBe(false);
  });

  it("NaN equal", () => expect(deepEqual(NaN, NaN)).toBe(true));

  it("arrays deep + order matters", () => {
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("objects ignore key order", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("nested mixed", () =>
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true));

  it("null vs undefined vs missing", () => {
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual({ a: undefined }, {})).toBe(false);
    expect(deepEqual(null, null)).toBe(true);
  });
});
