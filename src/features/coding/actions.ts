"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { progressApi } from "@/features/progress";
import { executeJavascript, PistonError } from "@/lib/piston";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { codingApi } from "./api/coding.api";
import { CODING_MESSAGES, MAX_CODE_BYTES, MAX_GOT_LEN } from "./constants";
import { buildHarness } from "./helpers/build-harness";
import { deepEqual } from "./helpers/deep-equal";
import { parsePistonResult } from "./helpers/parse-piston";
import type { GradeResult, GradeResultCase } from "./types";

function errorResult(message: string, totalCount = 0): GradeResult {
  return { status: "error", passedCount: 0, totalCount, cases: [], message };
}

/**
 * Chấm code an toàn:
 * - Đọc TOÀN BỘ test case bằng admin client (ca ẩn không lộ ra client).
 * - Sandbox CHỈ nhận args + trả giá trị (expected KHÔNG vào sandbox).
 * - So sánh pass/fail làm Ở ĐÂY (server, realm tin cậy) bằng deepEqual.
 * - Marker nonce mỗi lần chạy -> chống giả mạo dòng kết quả.
 * - Ca ẩn chỉ trả {index, pass}; ca mẫu mới kèm chi tiết.
 */
async function grade(
  problemId: string,
  code: string,
): Promise<{ result: GradeResult; questionId?: string }> {
  if (code.length > MAX_CODE_BYTES) return { result: errorResult(CODING_MESSAGES.tooLong) };

  const admin = createAdminClient();
  const spec = await codingApi.getGradingSpec(admin, problemId);
  if (!spec) return { result: errorResult(CODING_MESSAGES.notFound) };

  const marker = `__CJ_${randomUUID().replace(/-/g, "")}__`;
  const harness = buildHarness({
    userCode: code,
    functionName: spec.functionName,
    argsList: spec.cases.map((c) => c.args),
    marker,
    maxGotLen: MAX_GOT_LEN,
  });

  let raw;
  try {
    const run = await executeJavascript(harness, { timeoutMs: spec.timeLimitMs });
    raw = parsePistonResult(run, marker);
  } catch (e) {
    const msg = e instanceof PistonError ? e.message : CODING_MESSAGES.pistonError;
    return { result: errorResult(msg, spec.cases.length), questionId: spec.questionId };
  }

  if (!raw.ok) {
    return {
      result: errorResult(raw.message ?? CODING_MESSAGES.runtimeError, spec.cases.length),
      questionId: spec.questionId,
    };
  }

  // So sánh SERVER-SIDE. Duyệt theo spec.cases (nguồn tin cậy), tra kết quả theo index.
  const byIndex = new Map(raw.results.map((r) => [r.index, r]));
  const cases: GradeResultCase[] = spec.cases.map((c, i) => {
    const r = byIndex.get(i);
    let pass = false;
    let got: string | undefined;
    let error: string | null | undefined;
    if (r) {
      error = r.error;
      got = r.got ?? undefined;
      if (!r.error && r.got != null) {
        try {
          pass = deepEqual(JSON.parse(r.got), c.expected);
        } catch {
          pass = false;
        }
      }
    }
    if (c.isSample) {
      return { index: i, pass, isSample: true, args: c.args, expected: c.expected, got, error };
    }
    return { index: i, pass, isSample: false };
  });

  const passedCount = cases.filter((x) => x.pass).length;
  const totalCount = cases.length;
  const status: GradeResult["status"] =
    totalCount > 0 && passedCount === totalCount ? "passed" : "failed";

  return { result: { status, passedCount, totalCount, cases }, questionId: spec.questionId };
}

/** Chạy thử (không lưu). Yêu cầu đăng nhập để tránh lạm dụng sandbox. */
export async function runSolution(problemId: string, code: string): Promise<GradeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { result } = await grade(problemId, code);
  return result;
}

/** Nộp bài: chấm + lưu submission + log activity (nếu pass). */
export async function submitSolution(problemId: string, code: string): Promise<GradeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { result, questionId } = await grade(problemId, code);

  await supabase.from("coding_submissions").insert({
    user_id: user.id,
    problem_id: problemId,
    code,
    language: "javascript",
    status: result.status,
    passed_count: result.passedCount,
    total_count: result.totalCount,
    runtime_ms: null,
  });

  if (result.status === "passed" && questionId) {
    await progressApi.logActivity(supabase, user.id, "study", questionId).catch(() => {});
  }

  return result;
}
