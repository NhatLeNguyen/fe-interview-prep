import type { Enums } from "@/types/db";

/** 1 bài coding trong danh sách. */
export interface CodingProblemSummary {
  id: string; // coding_problems.id
  slug: string; // questions.slug
  title: string;
  level: Enums<"level">;
  difficulty: number;
  topicName: string | null;
  solved: boolean;
}

/** Test case hiển thị cho user (ca mẫu). */
export interface TestCaseSample {
  args: unknown[];
  expected: unknown;
}

/** Chi tiết 1 bài coding (chỉ ca mẫu — KHÔNG kèm ca ẩn). */
export interface CodingProblemDetail {
  id: string; // coding_problems.id
  slug: string;
  title: string;
  promptMd: string;
  functionName: string;
  starterCode: string;
  language: string;
  timeLimitMs: number;
  samples: TestCaseSample[];
}

/** 1 ca trong kết quả chấm đã LỌC để trả client (ẩn nội dung ca hidden). */
export interface GradeResultCase {
  index: number;
  pass: boolean;
  isSample: boolean;
  args?: unknown[]; // chỉ ca mẫu
  expected?: unknown; // chỉ ca mẫu
  got?: string; // chỉ ca mẫu
  error?: string | null; // chỉ ca mẫu
}

/** Kết quả chấm trả về client (an toàn — ca ẩn chỉ có index + pass). */
export interface GradeResult {
  status: "passed" | "failed" | "error";
  passedCount: number;
  totalCount: number;
  cases: GradeResultCase[];
  message?: string;
}
