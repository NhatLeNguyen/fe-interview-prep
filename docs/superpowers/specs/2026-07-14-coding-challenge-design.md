# Coding Challenge (P2.1) — Design Spec

**Ngày:** 2026-07-14 · **Phase:** 2 · **Trạng thái:** Approved (design), chờ implementation plan.

Tài liệu này mô tả thiết kế MVP cho tính năng **Coding Challenge** — cho phép user viết code JavaScript trong trình soạn thảo, chạy thử và nộp, được chấm tự động bằng test case qua sandbox **Piston** (dịch vụ execution ngoài, miễn phí).

Nguồn chân lý kiến trúc: [`docs/09-RECONCILED-ARCHITECTURE.md`](../../09-RECONCILED-ARCHITECTURE.md). Nguồn chân lý schema: [`docs/08-RECONCILED-SCHEMA.md`](../../08-RECONCILED-SCHEMA.md) (schema mới ở đây **mở rộng**, không phá vỡ).

---

## 1. Phạm vi (Scope)

### Trong MVP
- Ngôn ngữ thực thi: **JavaScript** (Node, chạy qua Piston). Editor cú pháp JS.
- Mô hình chấm: **function-based** — đề định nghĩa 1 hàm; mỗi test case = `{args, expected}`; harness gọi `functionName(...args)` và so sánh sâu (deep-equal) với `expected`.
- Sandbox: **Piston public API** (`https://emkc.org/api/v2/piston`) — miễn phí, không cần API key, không cần self-host. Piston tự enforce timeout & cô lập tiến trình (vòng lặp vô hạn bị cắt).
- Editor: **CodeMirror 6** (dynamic import tránh SSR), syntax JS, theme sáng/tối.
- Trang `/coding` (danh sách bài) + `/coding/[slug]` (workspace: đề + editor + Chạy/Nộp + kết quả).
- Lưu submission per-user; badge "Đã giải"; log activity để tính streak.
- Seed 3–5 bài JS mẫu qua script + `supabase/seeds/04_coding.sql`.

### Ngoài MVP (fast-follow, KHÔNG làm ở bước này)
- TypeScript **thực thi** (đổi runtime Piston) — MVP editor để JS.
- Admin UI tạo/sửa bài coding + test case (MVP **seed bằng script**).
- Tích hợp coding vào Learning Path (`item_type` đã có sẵn 'question' → mở rộng sau).
- Đa ngôn ngữ (Python…), leaderboard, gợi ý/hint, chạy theo thời gian thực (streaming).
- "Xem lời giải tham chiếu" (bảng `coding_solutions` admin-only) — xem §2.4.

### Quyết định đã chốt
- JS-only function-based (user chọn) · Piston public API · CodeMirror · standalone `/coding` · admin UI hoãn.

---

## 2. Data model (migration `0007_coding.sql`)

Một coding problem **là một `questions` với `type='coding'`** (tái dùng topic/level/difficulty/companies/search/soft-delete). Thêm 3 bảng:

### 2.1 `coding_problems` (1:1 với question)
```sql
create table public.coding_problems (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null unique references public.questions(id) on delete cascade,
  function_name text not null,                 -- vd 'twoSum'
  starter_code  text not null default '',      -- code khởi tạo trong editor (công khai — an toàn)
  language      text not null default 'javascript'
                check (language in ('javascript')),  -- MVP: chỉ JS; mở rộng sau
  time_limit_ms int  not null default 3000 check (time_limit_ms between 500 and 10000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_coding_problems_updated_at before update on public.coding_problems
  for each row execute function public.set_updated_at();
```

### 2.2 `coding_test_cases`
```sql
create table public.coding_test_cases (
  id          uuid primary key default gen_random_uuid(),
  problem_id  uuid not null references public.coding_problems(id) on delete cascade,
  args        jsonb not null,       -- mảng đối số: [2,[1,2,3]] -> fn(2,[1,2,3])
  expected    jsonb,                -- giá trị trả về kỳ vọng (jsonb; null hợp lệ)
  is_sample   boolean not null default false,  -- true = hiện cho user; false = ẩn (chấm)
  sort_order  int not null default 0
);
create index idx_coding_test_cases_problem on public.coding_test_cases (problem_id, sort_order);
```
> `args` LUÔN là JSON array (kể cả 1 đối số: `[x]`). `expected` là giá trị trả về (có thể là null/số/chuỗi/mảng/object).

### 2.3 `coding_submissions`
```sql
create table public.coding_submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  problem_id   uuid not null references public.coding_problems(id) on delete cascade,
  code         text not null,
  language     text not null default 'javascript',
  status       text not null check (status in ('passed','failed','error')),
  passed_count int  not null default 0,
  total_count  int  not null default 0,
  runtime_ms   int,
  created_at   timestamptz not null default now()
);
create index idx_coding_submissions_user    on public.coding_submissions (user_id, created_at desc);
create index idx_coding_submissions_problem on public.coding_submissions (user_id, problem_id);
```

### 2.4 RLS (migration cùng file hoặc nối vào `0006` pattern)
```sql
alter table public.coding_problems    enable row level security;
alter table public.coding_test_cases  enable row level security;
alter table public.coding_submissions enable row level security;

-- coding_problems: public read khi question cha đã publish & chưa xoá (hoặc admin)
create policy "coding_problems_public_read" on public.coding_problems
  for select to public using (
    exists (select 1 from public.questions q
            where q.id = question_id and q.is_published and q.deleted_at is null)
    or (select public.is_admin())
  );
create policy "coding_problems_admin_write" on public.coding_problems
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- coding_test_cases: CHỈ ca mẫu (is_sample=true) lộ ra ngoài; ca ẩn chỉ admin/server(service_role)
create policy "coding_test_cases_sample_read" on public.coding_test_cases
  for select to public using (
    (is_sample = true and exists (
       select 1 from public.coding_problems p
       join public.questions q on q.id = p.question_id
       where p.id = problem_id and q.is_published and q.deleted_at is null))
    or (select public.is_admin())
  );
create policy "coding_test_cases_admin_write" on public.coding_test_cases
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- coding_submissions: owner đọc/ghi của mình; admin đọc tổng hợp
create policy "coding_submissions_owner_all" on public.coding_submissions
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "coding_submissions_admin_read" on public.coding_submissions
  for select to authenticated using ((select public.is_admin()));
```

**Bất biến bảo mật:** client KHÔNG BAO GIỜ đọc được test case ẩn. Chấm điểm đọc **toàn bộ** test case bằng **admin client (service_role)** trong server action — đúng pattern `submitQuiz` hiện có.

> **Lưu ý cột nhạy cảm:** RLS là row-level, không column-level. `coding_problems` có policy public read → **mọi cột đều lộ**. Vì vậy MVP **không lưu `solution_code`** trong bảng này (grading chỉ cần test case). Tính năng "xem lời giải" là fast-follow: thêm bảng riêng `coding_solutions` với RLS admin-only. Mọi cột còn lại của `coding_problems` (function_name, starter_code, language, time_limit) đều an toàn để công khai.

---

## 3. Thực thi & chấm điểm

### 3.1 Piston client — `src/lib/piston.ts` (server-only)
- `executeJavascript(source: string, opts: { timeoutMs: number }): Promise<PistonRun>`
- `POST ${PISTON_URL}/execute` với body:
  ```json
  {
    "language": "javascript",
    "version": "<resolved>",
    "files": [{ "content": "<harness>" }],
    "run_timeout": <timeoutMs>,
    "compile_timeout": 10000,
    "stdin": ""
  }
  ```
- `version`: resolve từ `GET ${PISTON_URL}/runtimes` (lọc language==='javascript', lấy version) — cache trong module (memo). Fallback hardcode nếu fetch lỗi (vd `"18.15.0"`).
- Trả `{ run: { stdout, stderr, code, signal } }`.
- Env mới (optional): `PISTON_URL` (default `https://emkc.org/api/v2/piston`). Không cần key. Thêm vào `src/config/env.ts` (serverEnv, optional) + `.env.example`.
- Guard: giới hạn `source.length` (vd ≤ 50KB) trước khi gửi.

### 3.2 Build harness — `src/features/coding/helpers/build-harness.ts` (hàm THUẦN)
`buildHarness({ userCode, functionName, cases }): string` trả về source JS gửi lên Piston:
```
<userCode>

;(function () {
  function __deepEqual(a, b) { /* đệ quy: primitive, NaN, Array, plain object; không phụ thuộc thứ tự key */ }
  var __cases = <JSON.stringify(cases)>;      // gồm CẢ ca ẩn (chấm ở server)
  var __results = [];
  for (var i = 0; i < __cases.length; i++) {
    var got, err = null, pass = false;
    try {
      var fn = (typeof <functionName> === 'function') ? <functionName> : globalThis['<functionName>'];
      if (typeof fn !== 'function') throw new Error('Không tìm thấy hàm <functionName>');
      got = fn.apply(null, __cases[i].args);
      pass = __deepEqual(got, __cases[i].expected);
    } catch (e) { err = String((e && e.message) || e); }
    __results.push({ i: i, pass: pass, got: __safeStringify(got), error: err });
  }
  console.log('__CJRESULT__' + JSON.stringify({ results: __results }));
})();
```
- `<functionName>` được nội suy literal (đã validate `^[A-Za-z_$][\w$]*$` khi seed/admin).
- Marker `__CJRESULT__` để tách kết quả khỏi `console.log` của user.
- `got` được stringify an toàn để hiển thị (giới hạn độ dài).

### 3.3 Parse — `src/features/coding/helpers/parse-piston.ts` (hàm THUẦN)
`parsePistonResult(run): GradeResult`:
- Nếu có dòng `__CJRESULT__…` cuối stdout → parse JSON → map từng ca.
- Nếu không có (stderr có nội dung / code≠0) → `status='error'`, message = stderr rút gọn (compile/runtime error).
- `GradeResult = { status, passedCount, totalCount, cases: Array<{ index, pass, isSample, got?, error? }> }`.

### 3.4 Server actions — `src/features/coding/actions.ts`
- `runSolution(problemId, code)`: auth (redirect login nếu guest) → admin client đọc problem + **mọi** test case → buildHarness → executeJavascript → parse → trả GradeResult **đã lọc**: chi tiết `got/expected` chỉ cho ca **mẫu**; ca ẩn chỉ trả `pass` + index (giấu args/expected/got). KHÔNG lưu.
- `submitSolution(problemId, code)`: như trên + **lưu** `coding_submissions` (status/counts/runtime) + `progressApi.logActivity(..., 'study', questionId)` (tính streak). Trả GradeResult đã lọc.
- Cả hai: validate độ dài code, bắt lỗi Piston (network/5xx) → trả `status='error'` thân thiện.

---

## 4. Feature & UI

### 4.1 Cấu trúc thư mục (feature-first)
```
src/lib/piston.ts                         # client Piston (server-only)
src/features/coding/
  api/coding.api.ts        # listProblems(client,userId), getProblem(client,slug) [chỉ ca mẫu], getUserSolvedSet
  actions.ts               # runSolution, submitSolution ("use server")
  components/
    coding-workspace.tsx   # client: bố cục đề | editor+actions | kết quả (state code, chạy/nộp)
    code-editor.tsx        # client: CodeMirror 6 wrapper (dynamic import, theme-aware)
    result-panel.tsx       # client: hiển thị GradeResult (ca mẫu chi tiết, ca ẩn tổng hợp)
    problem-card.tsx       # card trong list
  helpers/
    build-harness.ts       # THUẦN
    parse-piston.ts        # THUẦN
  types.ts                 # CodingProblemSummary, CodingProblemDetail, TestCaseSample, GradeResult…
  constants.ts             # marker, giới hạn độ dài, msg
  index.ts                 # barrel
src/app/(app)/coding/page.tsx             # danh sách
src/app/(app)/coding/[slug]/page.tsx      # workspace
src/app/(app)/coding/[slug]/loading.tsx   # skeleton
supabase/migrations/0007_coding.sql
supabase/seeds/04_coding.sql
```
Ranh giới ESLint: `helpers/` không import React; feature import nhau qua barrel. `coding.api.ts` chỉ trả **ca mẫu** cho client; ca ẩn chỉ đụng ở `actions.ts` qua admin client.

### 4.2 Routes / UX
- **`/coding`** (Public\*): grid card (tiêu đề, LevelBadge, độ khó, topic) + badge "Đã giải" nếu user có submission `passed`. EmptyState nếu chưa seed.
- **`/coding/[slug]`**: workspace 2 cột (mobile: xếp dọc):
  - Trái: đề (`prompt_md` render markdown) + danh sách **ca mẫu** (input → expected).
  - Phải: CodeMirror (starter_code), nút **Chạy** (runSolution) / **Nộp** (submitSolution), `result-panel`.
  - Guest: editor chạy được nhưng nút Chạy/Nộp yêu cầu đăng nhập (redirect) — hoặc disable + link login. (Chốt: **yêu cầu đăng nhập** để chạy, tránh lạm dụng Piston.)
- Trang chi tiết câu hỏi coding (`/questions/[slug]`): nếu question có `coding_problems` → nút **"Mở trình soạn code"** → `/coding/[slug]`.
- Nav (`HeaderNav`): thêm **"Luyện code"** (public), sau "Lộ trình".
- Metadata động theo tên bài; `generateMetadata`.

### 4.3 Editor (CodeMirror 6)
- Packages: `codemirror`, `@codemirror/lang-javascript`, `@codemirror/view/state` (đi kèm meta-package). Theme: dùng `@codemirror/theme-one-dark` cho dark, theme mặc định cho light — chọn theo `next-themes` `resolvedTheme` (client).
- `code-editor.tsx` là client, khởi tạo EditorView trong `useEffect`, `onChange` đẩy code lên workspace state. Dynamic (chỉ client) để tránh SSR window.

---

## 5. Seed (`supabase/seeds/04_coding.sql` + script)

3–5 bài JS, mỗi bài = 1 `questions(type='coding')` + `coding_problems` + test cases (vài ca mẫu + vài ca ẩn). Ví dụ:
- `two-sum` (mảng + target → cặp index), `debounce` (khó hơn — nhưng cần thời gian; có thể chọn bài thuần tính toán), `flatten-array`, `fizzbuzz`, `unique-array`.
- Chọn bài **thuần input→output** (tránh phụ thuộc thời gian/async cho MVP chấm đơn giản).
- Script Node (như seed learning path) tra `topic_id` theo slug, chèn question + problem + cases, và ghi file SQL reproducible (idempotent: upsert theo question slug, xoá/chèn lại cases).

---

## 6. Bảo mật & giới hạn

- **Test ẩn không lộ:** RLS chỉ cho đọc ca mẫu; chấm dùng service_role. `coding.api.getProblem` chỉ select ca `is_sample=true`.
- **Code user chỉ chạy trong Piston**, không bao giờ trên server ta (không `eval`, không `vm`).
- **Rate limit Piston:** Piston public ~5 req/s toàn cục → thêm **cooldown client** (vd disable nút 1.5s sau mỗi lần chạy) + bắt lỗi 429 → thông báo "thử lại sau". (Server-side throttle per-user: fast-follow.)
- **Giới hạn input:** code ≤ 50KB; số test case/bài hợp lý.
- Không log code user ra nơi công khai; submission chỉ owner + admin đọc.

---

## 7. Kế hoạch verify

- **Unit (Vitest, hàm thuần):** `build-harness` (cấu trúc harness, nội suy tên hàm, escape), `parse-piston` (stdout có/không marker, error path), `deep-equal` (primitive/NaN/array/object/nested).
- **Gate:** `typecheck` · `lint` (kèm ranh giới) · `vitest` · `build`.
- **Runtime smoke:** seed 1 bài → gọi Piston thật với (a) lời giải đúng → all pass, (b) lời giải sai → fail đúng ca, (c) code lỗi cú pháp → status error; kiểm tra **HTML client KHÔNG chứa** args/expected của ca ẩn.
- **Adversarial review** (subagent): tập trung lỗ hổng lộ test ẩn, injection qua function_name, parse Piston sai, RLS.

---

## 8. Bước thủ công của user (đánh dấu)

- Chạy `supabase/migrations/0007_coding.sql` + `supabase/seeds/04_coding.sql` lên Supabase (như các migration trước).
- `npm install` các package CodeMirror (Claude chạy được, nhưng user nên biết dependency mới).
- (Không cần) Piston: dùng public API, không cần đăng ký. Nếu muốn tự host sau này → set `PISTON_URL`.

---

## 9. Câu hỏi mở / rủi ro

- **Piston version resolve:** phụ thuộc `/runtimes` của emkc — có fallback hardcode. Nếu emkc downtime → tính năng chạy hỏng (chấp nhận cho MVP; self-host là lối thoát).
- **TS execution:** hoãn; nếu user cần sớm → đổi `language` check + runtime Piston 'typescript'.
- **Async/Promise trong hàm user:** MVP giả định hàm đồng bộ trả giá trị. Nếu cần async → harness `await` (fast-follow).
