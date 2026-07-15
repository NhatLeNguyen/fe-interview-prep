import { describe, expect, it } from "vitest";

import { buildHarness } from "./build-harness";

const base = { functionName: "add", argsList: [[1, 2]], marker: "__M__", maxGotLen: 2000 };

describe("buildHarness", () => {
  it("embeds user code, args, marker", () => {
    const h = buildHarness({ ...base, userCode: "function add(a,b){return a+b}" });
    expect(h).toContain("function add(a,b)");
    expect(h).toContain("__M__");
    expect(h).toContain("[[1,2]]"); // argsList JSON
    expect(h).toContain("add");
  });

  it("does NOT embed expected or compare inside sandbox (leak/override guard)", () => {
    const h = buildHarness({ ...base, userCode: "" });
    expect(h).not.toContain("expected");
    expect(h).not.toContain("__deepEqual");
  });

  it("captures built-ins in a prologue BEFORE user code", () => {
    const h = buildHarness({ ...base, userCode: "USER_CODE_HERE" });
    expect(h.indexOf("__stringify = JSON.stringify")).toBeLessThan(h.indexOf("USER_CODE_HERE"));
  });

  it("rejects invalid function name (injection guard)", () => {
    expect(() => buildHarness({ ...base, userCode: "", functionName: "a; hack()" })).toThrow();
    expect(() => buildHarness({ ...base, userCode: "", functionName: "1bad" })).toThrow();
  });

  it("accepts valid identifiers", () => {
    expect(() => buildHarness({ ...base, userCode: "", functionName: "_twoSum$2" })).not.toThrow();
  });
});
