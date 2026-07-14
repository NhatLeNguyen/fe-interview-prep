import { afterEach, describe, expect, it, vi } from "vitest";

import { executeJavascript, PistonError } from "./piston";

function stubFetch(exec: { status?: number; body?: unknown }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (String(url).endsWith("/runtimes")) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ language: "javascript", version: "20.11.1" }],
        } as unknown as Response;
      }
      const status = exec.status ?? 200;
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => exec.body,
      } as unknown as Response;
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("executeJavascript", () => {
  it("maps run stdout/stderr/code", async () => {
    stubFetch({ body: { run: { stdout: "hi", stderr: "", code: 0 } } });
    const r = await executeJavascript("console.log('hi')", { timeoutMs: 2000 });
    expect(r).toEqual({ stdout: "hi", stderr: "", code: 0 });
  });

  it("throws PistonError on 429", async () => {
    stubFetch({ status: 429, body: {} });
    await expect(executeJavascript("x", { timeoutMs: 2000 })).rejects.toBeInstanceOf(PistonError);
  });
});
