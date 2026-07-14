"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { progressApi } from "@/features/progress";
import { executeJavascript, PistonError } from "@/lib/piston";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { codingApi } from "./api/coding.api";
import { CODING_MESSAGES, MAX_CODE_BYTES } from "./constants";
import { buildHarness } from "./helpers/build-harness";
import { parsePistonResult } from "./helpers/parse-piston";
import type { GradeResult, GradeResultCase } from "./types";

function errorResult(message: string, totalCount = 0): GradeResult {
  return { status: "error", passedCount: 0, totalCount, cases: [], message };
}

/**
 * Chấm code: đọc TOÀN BỘ test case bằng admin client (ca ẩn không lộ ra client),
 * ghép harness -> Piston -> parse -> LỌC (ca ẩn chỉ trả index+pass).
 */
async function grade(
  problemId: string,
  code: string,
): Promise<{ result: GradeResult; questionId?: string }> {
  if (code.length > MAX_CODE_BYTES) return { result: errorResult(CODING_MESSAGES.tooLong) };

  const admin = createAdminClient();
  const spec = await codingApi.getGradingSpec(admin, problemId);
  if (!spec) return { result: errorResult("Không tìm thấy bài.") };

  const harness = buildHarness({
    userCode: code,
    functionName: spec.functionName,
    cases: spec.cases.map((c) => ({ args: c.args, expected: c.expected })),
  });

  let raw;
  try {
    const run = await executeJavascript(harness, { timeoutMs: spec.timeLimitMs });
    raw = parsePistonResult(run);
  } catch (e) {
    const msg = e instanceof PistonError ? e.message : CODING_MESSAGES.pistonError;
    return { result: errorResult(msg, spec.cases.length), questionId: spec.questionId };
  }

  if (raw.status === "error") {
    return {
      result: errorResult(raw.message ?? CODING_MESSAGES.noResult, spec.cases.length),
      questionId: spec.questionId,
    };
  }

  const cases: GradeResultCase[] = raw.results.map((r) => {
    const spc = spec.cases[r.index];
    if (spc?.isSample) {
      return {
        index: r.index,
        pass: r.pass,
        isSample: true,
        args: spc.args,
        expected: spc.expected,
        got: r.got,
        error: r.error,
      };
    }
    return { index: r.index, pass: r.pass, isSample: false };
  });

  return {
    result: {
      status: raw.status,
      passedCount: raw.passedCount,
      totalCount: raw.totalCount,
      cases,
    },
    questionId: spec.questionId,
  };
}

/** Chạy thử (không lưu). Yêu cầu đăng nhập để tránh lạm dụng Piston. */
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
