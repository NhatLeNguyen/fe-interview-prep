import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { Enums } from "@/types/db";
import type { CodingProblemDetail, CodingProblemSummary, TestCaseSample } from "../types";

type Client = SupabaseClient<Database>;

/** "two-sum" -> "Two Sum" (questions không có cột title). */
function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Kết quả grading (đọc mọi test case — CHỈ dùng ở server với admin client). */
export interface GradingSpec {
  functionName: string;
  timeLimitMs: number;
  questionId: string;
  cases: { args: unknown[]; expected: unknown; isSample: boolean }[];
}

export const codingApi = {
  /** Danh sách bài coding (published) + trạng thái đã giải của user. */
  async listProblems(client: Client, userId: string | null): Promise<CodingProblemSummary[]> {
    const { data, error } = await client
      .from("coding_problems")
      .select(
        "id, questions!inner(slug, level, difficulty, is_published, deleted_at, topics(name))",
      )
      .eq("questions.is_published", true)
      .is("questions.deleted_at", null)
      .returns<
        {
          id: string;
          questions: {
            slug: string;
            level: Enums<"level">;
            difficulty: number;
            topics: { name: string } | null;
          };
        }[]
      >();
    if (error) throw new Error(error.message);

    const solved = new Set<string>();
    if (userId) {
      const { data: subs } = await client
        .from("coding_submissions")
        .select("problem_id")
        .eq("user_id", userId)
        .eq("status", "passed");
      for (const s of subs ?? []) solved.add(s.problem_id);
    }

    return (data ?? []).map((r) => ({
      id: r.id,
      slug: r.questions.slug,
      title: slugToTitle(r.questions.slug),
      level: r.questions.level,
      difficulty: r.questions.difficulty,
      topicName: r.questions.topics?.name ?? null,
      solved: solved.has(r.id),
    }));
  },

  /** Chi tiết 1 bài theo question.slug — CHỈ trả ca mẫu (is_sample=true). */
  async getProblem(client: Client, slug: string): Promise<CodingProblemDetail | null> {
    const { data, error } = await client
      .from("coding_problems")
      .select(
        "id, function_name, starter_code, language, time_limit_ms, questions!inner(slug, prompt_md, is_published, deleted_at)",
      )
      .eq("questions.slug", slug)
      .eq("questions.is_published", true)
      .is("questions.deleted_at", null)
      .returns<
        {
          id: string;
          function_name: string;
          starter_code: string;
          language: string;
          time_limit_ms: number;
          questions: { slug: string; prompt_md: string };
        }[]
      >()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const { data: cases } = await client
      .from("coding_test_cases")
      .select("args, expected")
      .eq("problem_id", data.id)
      .eq("is_sample", true)
      .order("sort_order", { ascending: true });

    const samples: TestCaseSample[] = (cases ?? []).map((c) => ({
      args: (c.args as unknown[]) ?? [],
      expected: c.expected,
    }));

    return {
      id: data.id,
      slug: data.questions.slug,
      title: slugToTitle(data.questions.slug),
      promptMd: data.questions.prompt_md,
      functionName: data.function_name,
      starterCode: data.starter_code,
      language: data.language,
      timeLimitMs: data.time_limit_ms,
      samples,
    };
  },

  /** CHỈ server (admin client): đọc TOÀN BỘ test case để chấm. */
  async getGradingSpec(admin: Client, problemId: string): Promise<GradingSpec | null> {
    const { data: p } = await admin
      .from("coding_problems")
      .select("function_name, time_limit_ms, question_id")
      .eq("id", problemId)
      .maybeSingle();
    if (!p) return null;

    const { data: cases } = await admin
      .from("coding_test_cases")
      .select("args, expected, is_sample")
      .eq("problem_id", problemId)
      .order("sort_order", { ascending: true });

    return {
      functionName: p.function_name,
      timeLimitMs: p.time_limit_ms,
      questionId: p.question_id,
      cases: (cases ?? []).map((c) => ({
        args: (c.args as unknown[]) ?? [],
        expected: c.expected,
        isSample: c.is_sample,
      })),
    };
  },
};
