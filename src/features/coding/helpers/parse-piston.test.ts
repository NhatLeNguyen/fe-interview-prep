import { describe, expect, it } from "vitest";

import { RESULT_MARKER } from "../constants";
import { parsePistonResult } from "./parse-piston";

const payload = (o: unknown) => RESULT_MARKER + JSON.stringify(o);

describe("parsePistonResult", () => {
  it("all pass", () => {
    const r = parsePistonResult({
      stdout: payload({ results: [{ i: 0, pass: true, got: "3" }] }),
      stderr: "",
      code: 0,
    });
    expect(r.status).toBe("passed");
    expect(r.passedCount).toBe(1);
    expect(r.totalCount).toBe(1);
  });

  it("some fail", () => {
    const r = parsePistonResult({
      stdout: payload({ results: [{ i: 0, pass: true }, { i: 1, pass: false, got: "9" }] }),
      stderr: "",
      code: 0,
    });
    expect(r.status).toBe("failed");
    expect(r.passedCount).toBe(1);
    expect(r.totalCount).toBe(2);
  });

  it("runtime error (no marker)", () => {
    const r = parsePistonResult({ stdout: "", stderr: "ReferenceError: x is not defined", code: 1 });
    expect(r.status).toBe("error");
    expect(r.message).toContain("ReferenceError");
  });

  it("ignores user console.log before marker", () => {
    const r = parsePistonResult({
      stdout: `hello\n${payload({ results: [{ i: 0, pass: true }] })}`,
      stderr: "",
      code: 0,
    });
    expect(r.status).toBe("passed");
  });
});
