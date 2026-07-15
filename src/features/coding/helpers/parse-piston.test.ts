import { describe, expect, it } from "vitest";

import { parsePistonResult } from "./parse-piston";

const M = "__CJ_abc123__";
const payload = (o: unknown) => M + JSON.stringify(o);

describe("parsePistonResult", () => {
  it("single marker -> ok + raw results (got only, no pass)", () => {
    const r = parsePistonResult(
      { stdout: payload({ results: [{ i: 0, got: "3", error: null }] }), stderr: "", code: 0 },
      M,
    );
    expect(r.ok).toBe(true);
    expect(r.results).toEqual([{ index: 0, got: "3", error: null }]);
  });

  it("no marker -> not ok, GENERIC message (never echoes stderr)", () => {
    const r = parsePistonResult(
      { stdout: "", stderr: "ReferenceError: SECRETLEAK is not defined", code: 1 },
      M,
    );
    expect(r.ok).toBe(false);
    expect(r.message).not.toContain("SECRETLEAK");
    expect(r.message).not.toContain("ReferenceError");
  });

  it("two marker lines -> not ok (anti-forgery)", () => {
    const r = parsePistonResult(
      {
        stdout: `${payload({ results: [{ i: 0, got: "1" }] })}\n${payload({ results: [{ i: 0, got: "9" }] })}`,
        stderr: "",
        code: 0,
      },
      M,
    );
    expect(r.ok).toBe(false);
  });

  it("ignores user stdout lines without the nonce marker", () => {
    const r = parsePistonResult(
      { stdout: `hello\n${payload({ results: [{ i: 0, got: "3" }] })}`, stderr: "", code: 0 },
      M,
    );
    expect(r.ok).toBe(true);
    expect(r.results.length).toBe(1);
  });
});
