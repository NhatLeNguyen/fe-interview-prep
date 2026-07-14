# Coding Challenge (P2.1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép user viết hàm JavaScript trong editor, chạy/nộp và được chấm tự động bằng test case qua sandbox Piston.

**Architecture:** Coding problem là `questions(type='coding')` + 3 bảng mới (`coding_problems`, `coding_test_cases`, `coding_submissions`). Chấm điểm ở **server action**: ghép harness JS (code user + runner), gửi **Piston public API**, parse kết quả. Test case ẩn chỉ đọc bằng **admin client (service_role)**, không bao giờ lộ ra client. UI: `/coding` (list) + `/coding/[slug]` (workspace CodeMirror).

**Tech Stack:** Next 16 App Router, Supabase (Postgres + RLS), TypeScript strict, CodeMirror 6, Piston (`emkc.org/api/v2/piston`), Vitest.

Spec: [`docs/superpowers/specs/2026-07-14-coding-challenge-design.md`](../specs/2026-07-14-coding-challenge-design.md).

## Global Constraints

- **KHÔNG auto-commit.** Cuối mỗi task: đưa commit message (tiếng Việt không dấu), user tự commit. (Xem memory `no-auto-commit`.)
- **Chỉ MỘT dev server**; sau `npm run build` phải `rm -rf .next` trước khi `next dev` (prod artifacts làm route `(app)` 404).
- **Không lộ service_role**; test case ẩn (`is_sample=false`) không được xuất hiện trong response/HTML gửi client.
- Kiến trúc feature-first (`docs/09`): `helpers/` cấm import React; feature import qua barrel.
- Ngôn ngữ MVP: **JavaScript** (Piston node). Editor JS.
- Gate mỗi task đụng code: `npm run typecheck` + `npm run lint` xanh.
- DB: user tự chạy migration/seed lên Supabase; script populate dùng `dangerouslyDisableSandbox: true` để test cục bộ.

---

### Task 1: Migration + database types

**Files:**
- Create: `supabase/migrations/0007_coding.sql`
- Modify: `src/lib/supabase/database.types.ts` (thêm 3 bảng)
- Create (scratch): script apply migration lên DB qua service_role

**Interfaces:**
- Produces: bảng `coding_problems`, `coding_test_cases`, `coding_submissions` + RLS; type `Database["public"]["Tables"]["coding_problems" | "coding_test_cases" | "coding_submissions"]`.

- [ ] **Step 1:** Viết `0007_coding.sql` theo §2 spec (3 `create table` + index + trigger updated_at cho `coding_problems` + `enable row level security` + 5 policy). Không có `solution_code`.
- [ ] **Step 2:** Apply lên Supabase bằng script Node (service_role, `dangerouslyDisableSandbox`) chạy từng statement, hoặc dùng `supabase db push` nếu user thích. Xác minh: `select` 3 bảng trả 0 rows (tồn tại).
- [ ] **Step 3:** Thêm 3 bảng vào `database.types.ts` (Row/Insert/Update/Relationships) khớp DDL. `args`/`expected` kiểu `Json`; `status` union `'passed'|'failed'|'error'`.
- [ ] **Step 4:** `npm run typecheck` — PASS.
- [ ] **Step 5:** Commit message: `feat(coding): migration 0007 + types cho coding_problems/test_cases/submissions`.

---

### Task 2: Pure helpers — deep-equal, build-harness, parse-piston (TDD)

**Files:**
- Create: `src/features/coding/helpers/deep-equal.ts`, `build-harness.ts`, `parse-piston.ts`
- Create: `src/features/coding/constants.ts` (marker, giới hạn)
- Test: `src/features/coding/helpers/deep-equal.test.ts`, `build-harness.test.ts`, `parse-piston.test.ts`

**Interfaces:**
- Produces:
  - `deepEqual(a: unknown, b: unknown): boolean`
  - `buildHarness(input: { userCode: string; functionName: string; cases: { args: unknown[]; expected: unknown }[] }): string`
  - `parsePistonResult(run: { stdout: string; stderr: string; code: number | null }): GradeRaw` với `GradeRaw = { status: 'passed'|'failed'|'error'; passedCount: number; totalCount: number; results: { index: number; pass: boolean; got?: string; error?: string | null }[]; message?: string }`
  - `RESULT_MARKER = "__CJRESULT__"`, `MAX_CODE_BYTES = 50_000`

- [ ] **Step 1 (deep-equal test):**
```ts
import { describe, expect, it } from "vitest";
import { deepEqual } from "./deep-equal";
describe("deepEqual", () => {
  it("primitives", () => { expect(deepEqual(1, 1)).toBe(true); expect(deepEqual(1, 2)).toBe(false); });
  it("NaN equal", () => expect(deepEqual(NaN, NaN)).toBe(true));
  it("arrays deep + order matters", () => {
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
  });
  it("objects ignore key order", () =>
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true));
  it("null vs undefined vs missing", () => {
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual({ a: undefined }, {})).toBe(false);
  });
});
```
- [ ] **Step 2:** Run `npx vitest run src/features/coding/helpers/deep-equal.test.ts` → FAIL (module chưa có).
- [ ] **Step 3:** Viết `deep-equal.ts`: đệ quy — `Object.is` cho primitive (xử lý NaN), so sánh Array (length + từng phần tử), plain object (cùng tập key + đệ quy value). Không import React.
- [ ] **Step 4:** Run test → PASS.
- [ ] **Step 5 (parse-piston test):**
```ts
import { describe, expect, it } from "vitest";
import { parsePistonResult } from "./parse-piston";
import { RESULT_MARKER } from "../constants";
const payload = (o: unknown) => RESULT_MARKER + JSON.stringify(o);
describe("parsePistonResult", () => {
  it("all pass", () => {
    const r = parsePistonResult({ stdout: payload({ results: [{ i: 0, pass: true, got: "3" }] }), stderr: "", code: 0 });
    expect(r.status).toBe("passed"); expect(r.passedCount).toBe(1); expect(r.totalCount).toBe(1);
  });
  it("some fail", () => {
    const r = parsePistonResult({ stdout: payload({ results: [{ i: 0, pass: true }, { i: 1, pass: false, got: "9" }] }), stderr: "", code: 0 });
    expect(r.status).toBe("failed"); expect(r.passedCount).toBe(1);
  });
  it("runtime error (no marker)", () => {
    const r = parsePistonResult({ stdout: "", stderr: "ReferenceError: x is not defined", code: 1 });
    expect(r.status).toBe("error"); expect(r.message).toContain("ReferenceError");
  });
  it("ignores user console.log before marker", () => {
    const r = parsePistonResult({ stdout: "hello\n" + payload({ results: [{ i: 0, pass: true }] }), stderr: "", code: 0 });
    expect(r.status).toBe("passed");
  });
});
```
- [ ] **Step 6:** Run → FAIL. **Step 7:** Viết `parse-piston.ts`: tách dòng cuối chứa `RESULT_MARKER`, JSON.parse phần sau marker; nếu không có marker → `status='error'`, `message` = stderr rút gọn (fallback "Không có kết quả"). Tính `passedCount`, `status = passed` khi mọi ca pass và totalCount>0, ngược lại `failed`. **Step 8:** Run → PASS.
- [ ] **Step 9 (build-harness test):**
```ts
import { describe, expect, it } from "vitest";
import { buildHarness } from "./build-harness";
import { RESULT_MARKER } from "../constants";
it("embeds user code, function name, cases, marker", () => {
  const h = buildHarness({ userCode: "function add(a,b){return a+b}", functionName: "add", cases: [{ args: [1, 2], expected: 3 }] });
  expect(h).toContain("function add(a,b)");
  expect(h).toContain(RESULT_MARKER);
  expect(h).toContain('"expected":3');
  expect(h).toContain("add");
});
it("rejects invalid function name", () => {
  expect(() => buildHarness({ userCode: "", functionName: "a; hack()", cases: [] })).toThrow();
});
```
- [ ] **Step 10:** Run → FAIL. **Step 11:** Viết `build-harness.ts`: validate `functionName` khớp `/^[A-Za-z_$][\w$]*$/` (throw nếu sai — chống injection), nội suy `userCode`, `JSON.stringify(cases)`, tên hàm literal, chèn `deepEqual` **dưới dạng chuỗi source** (một bản copy chạy trong Piston) + runner in `RESULT_MARKER + JSON.stringify(...)`. **Step 12:** Run → PASS.
- [ ] **Step 13:** `npm run lint` (ranh giới: helpers không import React) — PASS.
- [ ] **Step 14:** Commit message: `feat(coding): pure helpers deep-equal/build-harness/parse-piston + tests`.

---

### Task 3: Piston client lib + env

**Files:**
- Create: `src/lib/piston.ts`
- Modify: `src/config/env.ts` (thêm `PISTON_URL` optional vào serverEnv), `.env.example`
- Test: `src/lib/piston.test.ts` (mock fetch)

**Interfaces:**
- Consumes: (network) Piston `/execute`, `/runtimes`.
- Produces: `executeJavascript(source: string, opts: { timeoutMs: number }): Promise<{ stdout: string; stderr: string; code: number | null }>`; throws `PistonError` khi network/5xx/429.

- [ ] **Step 1:** Test với `vi.stubGlobal("fetch", ...)`: (a) execute trả `{ run: { stdout, stderr, code } }` → map đúng; (b) 429 → throw `PistonError` message chứa "thử lại"; (c) resolve version cache.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Viết `piston.ts`: `PISTON_URL` = `getServerEnv().PISTON_URL ?? "https://emkc.org/api/v2/piston"`; `resolveJsVersion()` memo (fetch `/runtimes`, lọc `language==='javascript'`, fallback `"18.15.0"`); `executeJavascript` POST `/execute` body theo §3.1; xử lý status 429/5xx → throw. Server-only (không "use client").
- [ ] **Step 4:** Run → PASS. **Step 5:** `npm run typecheck` + `lint` → PASS.
- [ ] **Step 6:** Commit message: `feat(coding): Piston client lib + env PISTON_URL`.

---

### Task 4: Feature types + api (sample-only cho client)

**Files:**
- Create: `src/features/coding/types.ts`, `src/features/coding/api/coding.api.ts`

**Interfaces:**
- Produces:
  - types: `CodingProblemSummary { id; slug; title; level; difficulty; topicName; solved: boolean }`, `TestCaseSample { args: unknown[]; expected: unknown }`, `CodingProblemDetail { id; slug; title; promptMd; functionName; starterCode; language; timeLimitMs; samples: TestCaseSample[] }`, `GradeResult` (đã lọc: samples chi tiết + hidden tổng hợp).
  - `codingApi.listProblems(client, userId|null): Promise<CodingProblemSummary[]>`
  - `codingApi.getProblem(client, slug): Promise<CodingProblemDetail | null>` — **chỉ** select ca `is_sample=true`.
  - `codingApi.getProblemForGrading(adminClient, problemId): Promise<{ functionName; timeLimitMs; cases: {args; expected; isSample}[] } | null>` — đọc **mọi** ca (admin).

- [ ] **Step 1:** Viết `types.ts`.
- [ ] **Step 2:** Viết `coding.api.ts`: `listProblems` join `coding_problems → questions(slug,prompt_md? title,level,difficulty,is_published,deleted_at, topics(name))` lọc published & not deleted; `solved` từ `coding_submissions` status='passed' của userId. `getProblem` lấy 1 problem theo question.slug + samples (`is_sample=true`, order sort_order). `getProblemForGrading` dùng client truyền vào (sẽ là admin) đọc mọi test case.
- [ ] **Step 3:** `npm run typecheck` + `lint` → PASS.
- [ ] **Step 4:** Commit message: `feat(coding): types + api (list/get sample-only/grading)`.

---

### Task 5: Server actions run/submit

**Files:**
- Create: `src/features/coding/actions.ts`
- Reuse: `createAdminClient` (từ `src/lib/supabase/*`), `progressApi.logActivity`.

**Interfaces:**
- Consumes: `buildHarness`, `parsePistonResult`, `executeJavascript`, `codingApi.getProblemForGrading`.
- Produces: `runSolution(problemId: string, code: string): Promise<GradeResult>`; `submitSolution(problemId: string, code: string): Promise<GradeResult>`.

- [ ] **Step 1:** Viết `actions.ts` ("use server"):
  - Guard: `getUser()`; nếu null → `redirect(LOGIN)`.
  - Validate `code.length <= MAX_CODE_BYTES` else trả `GradeResult` status='error' message.
  - `admin = createAdminClient()`; `spec = getProblemForGrading(admin, problemId)`; null → error.
  - `harness = buildHarness({ userCode: code, functionName, cases })`; `run = executeJavascript(harness, { timeoutMs: timeLimitMs })` trong try/catch (PistonError → error result).
  - `raw = parsePistonResult(run)`; map sang `GradeResult`: ca `isSample` trả `got`/expected/args; ca ẩn chỉ trả `{ index, pass }` (giấu nội dung).
  - `submitSolution`: thêm insert `coding_submissions` (status/passedCount/totalCount/runtime) + `logActivity(userClient, user.id, "study", questionId).catch(()=>{})`.
- [ ] **Step 2:** `npm run typecheck` + `lint` → PASS.
- [ ] **Step 3:** Commit message: `feat(coding): server actions runSolution/submitSolution (admin client + Piston)`.

---

### Task 6: Components (CodeMirror editor, result panel, workspace)

**Files:**
- Create: `src/features/coding/components/code-editor.tsx`, `result-panel.tsx`, `coding-workspace.tsx`
- Modify: `package.json` (thêm `codemirror`, `@codemirror/lang-javascript`, `@codemirror/theme-one-dark`)

**Interfaces:**
- Consumes: `runSolution`, `submitSolution`, `CodingProblemDetail`, `GradeResult`.
- Produces: `<CodingWorkspace problem={CodingProblemDetail} isAuthenticated={boolean} />`.

- [ ] **Step 1:** `npm install codemirror @codemirror/lang-javascript @codemirror/theme-one-dark`.
- [ ] **Step 2:** `code-editor.tsx` (client): khởi tạo `EditorView` trong `useEffect` (đóng khi unmount), `javascript()` extension, theme one-dark khi `resolvedTheme==='dark'`; prop `value`, `onChange(value)`. Không SSR (chỉ chạy trong effect).
- [ ] **Step 3:** `result-panel.tsx` (client): nhận `GradeResult | null` + `pending`; hiển thị badge tổng (passed/total), từng ca mẫu (args → expected → got, ✓/✗), ca ẩn tổng hợp ("Ẩn: X/Y"), lỗi (status='error' → message). Responsive.
- [ ] **Step 4:** `coding-workspace.tsx` (client): state `code` (khởi tạo `starterCode`), `result`, `pending` (useTransition); nút **Chạy** (`runSolution`) + **Nộp** (`submitSolution`) với **cooldown** 1.5s; guest → nút disable + link đăng nhập. Bố cục 2 cột `lg:grid-cols-2` (mobile dọc): trái = prompt (markdown) + samples, phải = editor + actions + result-panel.
- [ ] **Step 5:** `npm run typecheck` + `lint` + `npm run build` → PASS (kiểm CodeMirror bundle OK).
- [ ] **Step 6:** Commit message: `feat(coding): CodeMirror editor + result panel + workspace`.

---

### Task 7: Pages + nav + barrel + question CTA

**Files:**
- Create: `src/app/(app)/coding/page.tsx`, `src/app/(app)/coding/[slug]/page.tsx`, `src/app/(app)/coding/[slug]/loading.tsx`
- Create: `src/features/coding/index.ts` (barrel)
- Modify: `src/constants/routes.ts` (thêm `CODING`, `CODING_DETAIL`), `src/components/layout/header-nav.tsx` **không cần** (items truyền từ layout) → Modify `src/app/(app)/layout.tsx` (thêm item "Luyện code"); `src/app/(app)/questions/[slug]/page.tsx` (CTA nếu có coding problem).

**Interfaces:**
- Consumes: `codingApi`, `CodingWorkspace`.
- Produces: routes `/coding`, `/coding/[slug]`.

- [ ] **Step 1:** `routes.ts`: `CODING: "/coding"`, `CODING_DETAIL: (slug) => \`/coding/${slug}\``. Barrel export `codingApi`, `CodingWorkspace`, types.
- [ ] **Step 2:** `/coding/page.tsx`: `codingApi.listProblems` → grid `problem-card` (tạo `problem-card.tsx` hoặc inline) + EmptyState. Metadata "Luyện code".
- [ ] **Step 3:** `/coding/[slug]/page.tsx`: `getProblem`; null → `notFound()`; render header + `<CodingWorkspace>`; `generateMetadata` theo title.
- [ ] **Step 4:** `loading.tsx` skeleton.
- [ ] **Step 5:** Layout: thêm `{ href: ROUTES.CODING, label: "Luyện code" }` vào items (public, sau "Lộ trình").
- [ ] **Step 6:** `questions/[slug]/page.tsx`: query xem question có `coding_problems` → nếu có, nút "Mở trình soạn code" → `CODING_DETAIL(slug)`.
- [ ] **Step 7:** `npm run typecheck` + `lint` + `build` → PASS.
- [ ] **Step 8:** Commit message: `feat(coding): trang /coding + workspace + nav + CTA tu question`.

---

### Task 8: Seed 3–5 bài JS

**Files:**
- Create: `supabase/seeds/04_coding.sql` + script populate (scratch, service_role)

- [ ] **Step 1:** Script Node định nghĩa 3–5 bài thuần input→output (vd `two-sum`, `flatten-array`, `unique-array`, `fizzbuzz`, `title-case`), mỗi bài: question (type='coding', topic theo slug có sẵn, level, difficulty, prompt_md), coding_problem (function_name, starter_code), test cases (≥2 mẫu + ≥3 ẩn). Insert DB qua service_role + ghi `04_coding.sql` idempotent (upsert theo question slug; xoá/chèn lại problem + cases).
- [ ] **Step 2:** Chạy script → xác minh DB có N bài.
- [ ] **Step 3:** Commit message: `feat(coding): seed 04_coding.sql (N bai JS mau)`.

---

### Task 9: Verify + adversarial review

- [ ] **Step 1:** Gate: `typecheck` + `lint` + `npx vitest run` + `build` — tất cả PASS.
- [ ] **Step 2:** Runtime smoke (1 dev server, `rm -rf .next` nếu vừa build): `/coding` 200 (list), `/coding/[slug]` 200 (workspace render, samples hiện), bad slug 404. Gọi Piston thật (script hoặc UI): (a) lời giải đúng → all pass; (b) sai → fail đúng ca; (c) lỗi cú pháp → status error.
- [ ] **Step 3:** **Kiểm rò rỉ:** curl `/coding/[slug]` → HTML **không** chứa args/expected của ca ẩn; grade result cho ca ẩn không kèm nội dung.
- [ ] **Step 4:** Adversarial review (subagent) tập trung: lộ test ẩn, injection `function_name`, parse Piston sai/thiếu marker, RLS `coding_*`, guest bypass, cooldown. Apply fix.
- [ ] **Step 5:** Commit message: `test(coding): verify gate + smoke Piston + fix review`.

---

## Self-Review (đã chạy)

- **Spec coverage:** §2 data model→Task1; §3 exec→Task2/3/5; §4 UI→Task6/7; §5 seed→Task8; §6 bảo mật→Task4(sample-only)/5(admin)/9(kiểm rò rỉ); §7 verify→Task2/9. Đủ.
- **Placeholder scan:** không có TBD; code test cụ thể cho pure helpers.
- **Type consistency:** `GradeRaw` (helper) vs `GradeResult` (đã lọc, feature) — phân biệt rõ; `getProblemForGrading` trả cases có `isSample` để action lọc.
- **Rủi ro:** Piston version resolve phụ thuộc emkc (có fallback); async function user (MVP đồng bộ).
