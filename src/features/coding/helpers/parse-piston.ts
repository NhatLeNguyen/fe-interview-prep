import { CODING_MESSAGES, RESULT_MARKER } from "../constants";

/** Kết quả chấm THÔ từ output Piston (chưa lọc ca ẩn). */
export interface GradeRaw {
  status: "passed" | "failed" | "error";
  passedCount: number;
  totalCount: number;
  results: { index: number; pass: boolean; got?: string; error?: string | null }[];
  message?: string;
}

interface PistonRun {
  stdout: string;
  stderr: string;
  code: number | null;
}

function truncate(s: string, max = 2000): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/**
 * Parse stdout/stderr từ Piston -> kết quả chấm (hàm THUẦN).
 * Lấy dòng CUỐI chứa RESULT_MARKER (bỏ qua console.log của user).
 * Không có marker -> lỗi biên dịch/runtime (message = stderr).
 */
export function parsePistonResult(run: PistonRun): GradeRaw {
  const lines = run.stdout.split("\n");
  const markerLine = [...lines].reverse().find((l) => l.includes(RESULT_MARKER));

  if (!markerLine) {
    const msg = (run.stderr || "").trim() || CODING_MESSAGES.noResult;
    return { status: "error", passedCount: 0, totalCount: 0, results: [], message: truncate(msg) };
  }

  const json = markerLine.slice(markerLine.indexOf(RESULT_MARKER) + RESULT_MARKER.length);
  let parsed: { results?: { i: number; pass: boolean; got?: string; error?: string | null }[] };
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      status: "error",
      passedCount: 0,
      totalCount: 0,
      results: [],
      message: CODING_MESSAGES.invalidResult,
    };
  }

  const results = (parsed.results ?? []).map((r) => ({
    index: r.i,
    pass: Boolean(r.pass),
    got: r.got,
    error: r.error ?? null,
  }));
  const passedCount = results.filter((r) => r.pass).length;
  const totalCount = results.length;
  const status: GradeRaw["status"] =
    totalCount > 0 && passedCount === totalCount ? "passed" : "failed";

  return { status, passedCount, totalCount, results };
}
