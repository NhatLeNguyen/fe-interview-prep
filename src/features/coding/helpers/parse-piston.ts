import { CODING_MESSAGES } from "../constants";

/** 1 ca thô từ sandbox: chỉ giá trị trả về (đã serialize) + lỗi runtime của ca đó. */
export interface RawCase {
  index: number;
  got: string | null; // JSON string của giá trị trả về (hoặc null)
  error: string | null;
}

/** Kết quả THÔ: sandbox chỉ trả giá trị — CHƯA chấm (chấm ở server). */
export interface GradeRaw {
  ok: boolean; // harness chạy tới marker & JSON hợp lệ
  results: RawCase[];
  message?: string; // khi !ok — thông báo GENERIC (không echo stderr)
}

interface PistonRun {
  stdout: string;
  stderr: string;
  code: number | null;
}

/**
 * Parse stdout từ sandbox theo `marker` (nonce mỗi lần chạy).
 * - Đúng 1 dòng chứa marker & JSON hợp lệ -> ok, trả results.
 * - 0 dòng (lỗi biên dịch/runtime) hoặc >1 (nghi giả mạo) -> !ok, message GENERIC.
 * KHÔNG bao giờ echo stderr ra ngoài (tránh kênh rò rỉ). THUẦN.
 */
export function parsePistonResult(run: PistonRun, marker: string): GradeRaw {
  const markerLines = run.stdout.split("\n").filter((l) => l.includes(marker));
  if (markerLines.length !== 1) {
    return { ok: false, results: [], message: CODING_MESSAGES.runtimeError };
  }
  const line = markerLines[0];
  const json = line.slice(line.indexOf(marker) + marker.length);

  let parsed: { results?: { i: number; got?: string | null; error?: string | null }[] };
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, results: [], message: CODING_MESSAGES.runtimeError };
  }

  const results: RawCase[] = (parsed.results ?? []).map((r) => ({
    index: r.i,
    got: r.got ?? null,
    error: r.error ?? null,
  }));
  return { ok: true, results };
}
