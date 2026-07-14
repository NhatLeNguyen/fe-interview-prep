import { describe, expect, it } from "vitest";

import { RESULT_MARKER } from "../constants";
import { buildHarness } from "./build-harness";

describe("buildHarness", () => {
  it("embeds user code, function name, cases, marker", () => {
    const h = buildHarness({
      userCode: "function add(a,b){return a+b}",
      functionName: "add",
      cases: [{ args: [1, 2], expected: 3 }],
    });
    expect(h).toContain("function add(a,b)");
    expect(h).toContain(RESULT_MARKER);
    expect(h).toContain('"expected":3');
    expect(h).toContain("add");
  });

  it("rejects invalid function name (injection guard)", () => {
    expect(() =>
      buildHarness({ userCode: "", functionName: "a; hack()", cases: [] }),
    ).toThrow();
    expect(() => buildHarness({ userCode: "", functionName: "1bad", cases: [] })).toThrow();
  });

  it("accepts valid identifiers", () => {
    expect(() =>
      buildHarness({ userCode: "", functionName: "_twoSum$2", cases: [] }),
    ).not.toThrow();
  });
});
