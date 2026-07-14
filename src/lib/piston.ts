/**
 * Client cho Piston — dịch vụ execution ngoài (miễn phí, không cần key).
 * CHỈ dùng server-side (import từ Server Action). Mặc định dùng API public emkc.
 * Tự host: set PISTON_URL trong env.
 */

const DEFAULT_PISTON_URL = "https://emkc.org/api/v2/piston";
const FALLBACK_JS_VERSION = "18.15.0";

export class PistonError extends Error {}

function baseUrl(): string {
  const u = process.env.PISTON_URL?.trim();
  return u && u.length > 0 ? u.replace(/\/+$/, "") : DEFAULT_PISTON_URL;
}

let cachedVersion: string | null = null;

/** Lấy version runtime javascript của Piston (memo; fallback nếu /runtimes lỗi). */
async function resolveJsVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  try {
    const res = await fetch(`${baseUrl()}/runtimes`, { cache: "no-store" });
    if (res.ok) {
      const runtimes = (await res.json()) as {
        language: string;
        version: string;
        aliases?: string[];
      }[];
      // Ưu tiên runtime NODE (Piston public liệt kê cả Deno dưới language 'javascript').
      const js =
        runtimes.find((r) => r.language === "javascript" && r.aliases?.includes("node-js")) ??
        runtimes.find((r) => r.language === "javascript" && !r.aliases?.includes("deno-js")) ??
        runtimes.find((r) => r.language === "javascript");
      if (js?.version) {
        cachedVersion = js.version;
        return cachedVersion;
      }
    }
  } catch {
    // rơi xuống fallback
  }
  cachedVersion = FALLBACK_JS_VERSION;
  return cachedVersion;
}

export interface PistonRun {
  stdout: string;
  stderr: string;
  code: number | null;
}

/** Chạy 1 file JavaScript trên Piston, trả stdout/stderr/exit code. */
export async function executeJavascript(
  source: string,
  opts: { timeoutMs: number },
): Promise<PistonRun> {
  const version = await resolveJsVersion();

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/execute`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        language: "javascript",
        version,
        files: [{ content: source }],
        run_timeout: opts.timeoutMs,
        compile_timeout: 10_000,
        stdin: "",
      }),
    });
  } catch {
    throw new PistonError("Không kết nối được trình chạy code.");
  }

  if (res.status === 429) throw new PistonError("Bị giới hạn tần suất, thử lại sau ít giây.");
  if (!res.ok) throw new PistonError(`Trình chạy lỗi (HTTP ${res.status}).`);

  const data = (await res.json()) as {
    run?: { stdout?: string; stderr?: string; code?: number | null };
  };
  const run = data.run ?? {};
  return { stdout: run.stdout ?? "", stderr: run.stderr ?? "", code: run.code ?? null };
}
