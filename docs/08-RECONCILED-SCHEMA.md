> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

# 🔒 08 — RECONCILED SCHEMA (Single Source of Truth)

> **Đây là nguồn chân lý DUY NHẤT cho database.** Thay thế phần schema trong [04-supabase-data-model.md](./04-supabase-data-model.md). Mọi migration & generated types phải bám theo file này. Sinh sau **Reconcile Gate** — đã đóng R1/R2/R3 + R5/R6/R7 + 17 issue reviewer.

---

# FE Interview Prep — Unified Postgres/Supabase Schema (Single Source of Truth · Build-Ready v2)

> Tài liệu này **chốt dứt điểm** mọi mâu thuẫn (`docs/02`, `docs/04`, `docs/07`) và **đóng 3 blocker (R1/R2/R3) + R5/R6/R7 + 17 issue reviewer**. Đây là **nguồn chân lý DUY NHẤT** cho schema. Sau tài liệu này: chạy migration theo thứ tự → `supabase gen types` → build. Giải thích bằng tiếng Việt (giữ term EN); SQL/TypeScript bằng English.

---

## 0. THỨ TỰ MIGRATION (chuẩn hoá — Issue 13, 17)

```
0000_extensions          -- pgcrypto
0001_types               -- ENUMS + set_updated_at()   ⚠️ set_updated_at Ở ĐÂY (Issue 17)
0002_tables_content      -- profiles → categories → topics → tags → questions → question_tags
0003_tables_quiz         -- quiz_sets → quiz_set_questions → quiz_attempts → quiz_attempt_answers
0004_tables_learning     -- flashcard_states → review_logs → learning_paths → learning_path_items
                         --   → learning_path_progress → user_topic_progress → user_question_progress
                         --   → bookmarks → user_activity
0005_functions_triggers  -- is_admin() → enforce_role_guard() → handle_new_user()
                         --   → build_question_search() + search triggers
0006_rls_policies        -- enable RLS + policies + column-level GRANT/REVOKE (Issue 8)
```

**2 điểm bẫy đã chốt:**
- `set_updated_at()` nằm ở **0001** (mọi trigger `trg_*_updated_at` inline trong 0002–0004 phụ thuộc nó). **KHÔNG** để vào 0005 — nếu để, mọi trigger updated_at fail `function does not exist` (Issue 17).
- `question_tags` phải `CREATE` **NGAY SAU** `questions` (FK trỏ tới `questions`) — xem §3.6 (Issue 13).

---

## 1. QUYẾT ĐỊNH CHỐT (Reconcile decisions)

### 1.1. Bảng tên chuẩn cuối cùng (R2 — one canonical name set)

| Vai trò | Biến thể trong docs | ✅ Tên chuẩn CUỐI CÙNG |
|---|---|---|
| Profile mở rộng auth.users | `profiles` | **`profiles`** (+ streak) |
| Nhóm lớn | `categories` | **`categories`** (+ `deleted_at`) |
| Chủ đề con | `topics` | **`topics`** (+ `deleted_at`) |
| Nhãn phẳng | `tags` | **`tags`** |
| Join câu ↔ tag | `question_tags` | **`question_tags`** |
| Ngân hàng câu hỏi | `questions` / `question_contents` (tách) | **`questions`** (gộp content) |
| Bộ đề **preset** (curated) | `quizzes` | **`quiz_sets`** |
| Join bộ đề ↔ câu | `quiz_questions` | **`quiz_set_questions`** |
| Lượt làm bài (preset **và** custom) | `quiz_attempts` + `quiz_sessions` | **`quiz_attempts`** (gộp) |
| Đáp án từng câu trong lượt | `quiz_attempt_answers` | **`quiz_attempt_answers`** |
| Trạng thái SRS mỗi (user, câu) | `flashcards`/`flashcard_reviews`/`user_flashcards` | **`flashcard_states`** |
| Log SRS bất biến | `review_logs` | **`review_logs`** |
| Lộ trình | `learning_paths` | **`learning_paths`** (+ `deleted_at`) |
| Item lộ trình (flat) | `learning_path_items`/`path_modules`+`path_steps` | **`learning_path_items`** (flat + `module_title`/`step_key`) |
| Tiến độ lộ trình per-item | `user_path_progress`/**thiếu** | **`learning_path_progress`** (BẢNG MỚI — R1) |
| Tiến độ theo topic (aggregate) | `user_topic_progress`/`user_progress` | **`user_topic_progress`** |
| Tiến độ **từng câu** | **thiếu** | **`user_question_progress`** (BẢNG MỚI) |
| Bookmark | `bookmarks`/`user_bookmarks` | **`bookmarks`** |
| Streak / activity / heatmap | `activity_log`/**thiếu** | **`user_activity`** (+ counters trên `profiles`) |

**Không có bất kỳ tên lệch nào còn tồn tại.** Mọi FK/policy/trigger dưới đây tham chiếu đúng bộ tên này.

### 1.2. Chốt song ngữ (đảo ngược `docs/04 §1`)

> **Nội dung = MỘT đoạn văn tiếng Việt GIỮ NGUYÊN thuật ngữ EN** (`closure`, `hoisting`, `reconciliation`…), **KHÔNG** phải 2 bản dịch VI/EN.

| `docs/04` (bỏ) | ✅ Chốt |
|---|---|
| `name_vi`+`name_en` | **`name`** |
| `description_vi`+`description_en` | **`description`** |
| `question_vi`+`question_en` | **`prompt_md`** |
| `answer_vi`+`answer_en` | **`answer_md`** |
| `title_vi`+`title_en` | **`title`** |
| `{text_vi,text_en}` | `{key, text, explanation}` |
| `search_vi`+`search_en` | **`search`** (1 tsvector, config `simple`) |

- **i18n CHỈ cho UI strings** → xử lý ở **frontend** (`next-intl`/dictionary), **KHÔNG** lưu DB.
- FTS dùng config **`simple`** (Postgres không có dict tiếng Việt; content trộn VI+EN → `simple` tách token + case-fold, tránh stemming sai).

### 1.3. Chốt slug (R7)

`questions.slug`, `categories.slug`, `topics.slug`, `tags.slug`, `quiz_sets.slug`, `learning_paths.slug` = **`text NOT NULL UNIQUE`**.

### 1.4. Chốt soft-delete (Issue 1 — major)

Admin "xoá" nội dung = **`deleted_at = now()` + `is_published = false`**, KHÔNG bao giờ `DELETE` thật. Để chặn hard-delete cascade nuốt dữ liệu:
- Thêm `deleted_at` cho **`categories`, `topics`, `learning_paths`** (trước chỉ `questions`, `quiz_sets` có).
- **`topics.category_id` và `questions.topic_id` đổi sang `ON DELETE RESTRICT`** → cắt đứt chuỗi cascade `category → topic → question → (bookmarks/flashcard_states/…)`. Một `DELETE category` giờ **fail** nếu còn topic/question con (đúng ý soft-delete).
- Các `public_read` policy của 3 bảng trên thêm điều kiện `deleted_at is null`.

---

## 2. ENUM & kiểu phân loại (R3 — khớp taxonomy `docs/01`)

```sql
-- 0000_extensions.sql
create extension if not exists pgcrypto;   -- gen_random_uuid()
```

```sql
-- 0001_types.sql  (ENUMS + set_updated_at — Issue 17)

-- R3: KIND (dạng câu hỏi) — KHỚP taxonomy §3.1, KHÁC "answer format"
create type public.question_type as enum
  ('theory', 'coding', 'quiz', 'system-design', 'behavioral');

-- R3: TÁCH level (seniority) KHỎI difficulty (độ khó thuần)
create type public.level as enum ('junior', 'mid', 'senior');

-- Answer format: CHỈ khi question_type = 'quiz'
create type public.answer_format as enum
  ('single_choice', 'multiple_choice', 'true_false');

-- R1: nguồn của một lượt quiz
create type public.quiz_source as enum ('preset', 'custom');

create type public.user_role       as enum ('user', 'admin');
create type public.attempt_status  as enum ('in_progress', 'completed', 'abandoned');
create type public.progress_status as enum ('not_started', 'in_progress', 'completed');
create type public.path_item_type  as enum ('topic', 'quiz_set', 'question');

-- R5: SRS card state (Anki-style)
create type public.flashcard_state as enum ('new', 'learning', 'review', 'relearning');

-- R5: nguồn streak/heatmap
create type public.activity_type   as enum ('study', 'review', 'quiz', 'path');

-- Hàm dùng chung updated_at (PHẢI ở 0001 — trước mọi bảng)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

> **`difficulty` (1–5) & `frequency` (1–5) KHÔNG dùng enum** — dùng `smallint` + `CHECK (… between 1 and 5)`: giá trị có thứ tự, hay `ORDER BY`/`BETWEEN`/so sánh (`frequency >= 4` build "must-know deck"), dễ mở rộng thang.

---

## 3. FULL DDL (thứ tự CREATE theo phụ thuộc: cha trước con)

### 3.1. `profiles` — mở rộng `auth.users` + streak (R5)

```sql
-- 0002_tables_content.sql
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text,
  full_name        text,
  avatar_url       text,
  role             public.user_role not null default 'user',   -- nguồn chân lý admin
  -- Preferences (UI settings — KHÔNG phải content translation)
  locale           text not null default 'vi',
  theme            text not null default 'system',             -- light | dark | system
  daily_new_cards  int  not null default 20,                   -- SRS: new/ngày
  streak_goal      int,
  -- R5: streak counters (cache O(1); nguồn gốc = user_activity)
  current_streak   int  not null default 0,
  longest_streak   int  not null default 0,
  last_active_date date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

comment on table  public.profiles is '1-1 với auth.users; role=admin; streak counters cache từ user_activity.';
comment on column public.profiles.role is 'Nguồn chân lý phân quyền admin. Non-admin KHÔNG đổi được (enforce_role_guard §5).';
```

### 3.2. `categories` (+ `deleted_at` — Issue 1)

```sql
create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,                 -- 1 field (VI giữ term EN)
  description  text,
  icon         text,
  color        text,
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  deleted_at   timestamptz,                   -- Issue 1: soft delete
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_categories_sort on public.categories (sort_order) where deleted_at is null;
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
```

### 3.3. `topics` (+ `deleted_at`; FK category_id → RESTRICT — Issue 1)

```sql
create table public.topics (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories(id) on delete restrict, -- Issue 1
  slug         text not null unique,
  name         text not null,
  description  text,
  level        public.level not null default 'junior',   -- "level trội" của topic (R3)
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  deleted_at   timestamptz,                               -- Issue 1
  -- FTS cho search-group theo Topic (§2.7) — generated OK vì chỉ tham chiếu cột own
  search tsvector generated always as (
    to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''))
  ) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_topics_category  on public.topics (category_id);
create index idx_topics_published on public.topics (is_published) where deleted_at is null;
create index idx_topics_search    on public.topics using gin (search);
create trigger trg_topics_updated_at before update on public.topics
  for each row execute function public.set_updated_at();

comment on column public.topics.level is 'Level trội (seniority). Mỗi question vẫn có level riêng.';
```

### 3.4. `tags`

```sql
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);
```

### 3.5. `questions` — bảng trung tâm (R3, R7; FK topic_id → RESTRICT; answer_md NULLable)

```sql
create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,                          -- R7: NOT NULL + UNIQUE
  topic_id       uuid not null references public.topics(id) on delete restrict,  -- Issue 1
  subtopic       text,

  -- R3: TÁCH kind / level / difficulty / frequency
  type           public.question_type not null,                -- KIND
  answer_format  public.answer_format,                          -- chỉ khi type='quiz'
  level          public.level    not null default 'junior',     -- seniority
  difficulty     smallint not null default 1 check (difficulty between 1 and 5),
  frequency      smallint not null default 1 check (frequency  between 1 and 5),
  estimated_time_sec int,

  -- Nội dung: MỘT field markdown (VI giữ term EN)
  prompt_md      text not null,                                 -- đề bài
  answer_md      text,                                          -- Issue 2: NULLable (cho phép draft)

  -- Trắc nghiệm (chỉ khi type='quiz')
  options        jsonb,          -- [{"key":"a","text":"...","explanation":"..."}]
  correct_keys   text[],         -- ['b'] hoặc ['a','c']

  -- Bổ trợ
  code_snippet   text,
  code_language  text,
  reference_links jsonb,
  companies      text[],
  related_question_ids uuid[],

  is_deprecated  boolean not null default false,
  is_published   boolean not null default true,
  deleted_at     timestamptz,                                   -- soft delete
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- FTS: trigger-maintained (content + tag names). KHÔNG generated vì cần join question_tags (Issue 4)
  search tsvector,

  -- Issue 12: cardinality() trả 0 cho array rỗng (array_length trả NULL → CHECK lọt). PHẢI có ≥1 đáp án đúng.
  constraint chk_quiz_shape check (
    type <> 'quiz'
    or (answer_format is not null
        and options is not null
        and coalesce(cardinality(correct_keys), 0) >= 1)
  ),
  -- answer_format chỉ tồn tại cho quiz
  constraint chk_format_scope check ( type = 'quiz' or answer_format is null ),
  -- Issue 2: draft (unpublished) được thiếu đáp án; published PHẢI có đáp án non-empty
  constraint chk_published_needs_answer check (
    is_published = false
    or (answer_md is not null and btrim(answer_md) <> '')
  )
);

create index idx_questions_topic      on public.questions (topic_id);
create index idx_questions_type        on public.questions (type);
create index idx_questions_level       on public.questions (level);
create index idx_questions_difficulty  on public.questions (difficulty);
create index idx_questions_frequency   on public.questions (frequency);
create index idx_questions_published   on public.questions (is_published) where deleted_at is null;
create index idx_questions_search      on public.questions using gin (search);
create trigger trg_questions_updated_at before update on public.questions
  for each row execute function public.set_updated_at();

comment on column public.questions.type is 'KIND (taxonomy). KHÁC answer_format. Quiz module chỉ dùng type=''quiz''.';
comment on column public.questions.answer_md is 'NULLable: draft (is_published=false) được thiếu. "Câu thiếu đáp án" = answer_md is null or btrim(answer_md)='''' (Issue 2).';
comment on column public.questions.search is 'Trigger-maintained (§5): prompt_md + answer_md + tag names. Refresh khi content đổi HOẶC question_tags đổi (Issue 4).';
comment on column public.questions.correct_keys is 'App/server đảm bảo là tập con của options[].key (không ép được thuần khai báo).';
```

### 3.6. `question_tags` (đặt NGAY SAU questions — Issue 13)

```sql
create table public.question_tags (
  question_id uuid not null references public.questions(id) on delete cascade,
  tag_id      uuid not null references public.tags(id)      on delete cascade,
  primary key (question_id, tag_id)
);
create index idx_question_tags_tag on public.question_tags (tag_id);
```

### 3.7. `quiz_sets` + `quiz_set_questions` (bộ đề PRESET)

```sql
-- 0003_tables_quiz.sql
create table public.quiz_sets (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  category_id    uuid references public.categories(id) on delete set null,
  title          text not null,
  description    text,
  level          public.level not null default 'junior',
  time_limit_sec int,
  pass_score     smallint not null default 70 check (pass_score between 0 and 100),
  is_published   boolean not null default true,
  deleted_at     timestamptz,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_quiz_sets_updated_at before update on public.quiz_sets
  for each row execute function public.set_updated_at();

create table public.quiz_set_questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_set_id uuid not null references public.quiz_sets(id)  on delete cascade,
  question_id uuid not null references public.questions(id)  on delete cascade,
  sort_order  int  not null default 0,
  points      int  not null default 1,
  unique (quiz_set_id, question_id)
);
create index idx_quiz_set_questions_set on public.quiz_set_questions (quiz_set_id);

comment on table public.quiz_sets is 'Bộ đề admin curated (preset). Custom quiz KHÔNG có row ở đây.';
```

### 3.8. `quiz_attempts` (R1) + `quiz_attempt_answers` (composite FK — Issue 16/11)

```sql
create table public.quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,

  -- R1: hỗ trợ CUSTOM QUIZ — quiz_set_id NULLABLE
  quiz_source     public.quiz_source not null,
  quiz_set_id     uuid references public.quiz_sets(id) on delete set null,  -- NULL cho custom
  config          jsonb,          -- custom: {topics:[],level,difficulty:[min,max],count,timed,seed}
  question_ids    uuid[] not null default '{}',

  status          public.attempt_status not null default 'in_progress',
  score           numeric(5,2),   -- % ; server-computed (Issue 8)
  correct_count   int,            -- server-computed (Issue 8)
  total_questions int,
  duration_sec    int,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,

  -- R1: custom ⇒ không gắn bộ đề
  constraint chk_custom_no_set check (
    (quiz_source = 'custom'  and quiz_set_id is null) or (quiz_source = 'preset')
  ),
  -- Issue 16: target cho composite FK từ quiz_attempt_answers
  unique (id, user_id)
);
create index idx_quiz_attempts_user   on public.quiz_attempts (user_id);
create index idx_quiz_attempts_set     on public.quiz_attempts (quiz_set_id);
create index idx_quiz_attempts_status  on public.quiz_attempts (user_id, status);

create table public.quiz_attempt_answers (
  id            uuid primary key default gen_random_uuid(),
  attempt_id    uuid not null,
  user_id       uuid not null,                                  -- denormalize cho RLS nhanh
  question_id   uuid not null references public.questions(id) on delete cascade,
  selected_keys text[] not null default '{}',
  is_correct    boolean,                                        -- server-computed (Issue 8)
  answered_at   timestamptz not null default now(),
  unique (attempt_id, question_id),
  -- Issue 16 + 11: composite FK ép (attempt_id,user_id) khớp CHỦ SỞ HỮU attempt.
  -- ⇒ không thể chèn answer vào attempt của user khác (giải quyết griefing Issue 11 ở tầng DB).
  foreign key (attempt_id, user_id)
    references public.quiz_attempts(id, user_id) on delete cascade
);
create index idx_attempt_answers_attempt on public.quiz_attempt_answers (attempt_id);
create index idx_attempt_answers_user    on public.quiz_attempt_answers (user_id);

comment on constraint chk_custom_no_set on public.quiz_attempts is
  'R1: custom ⇒ quiz_set_id NULL. Chỉ ép chiều custom (ON DELETE SET NULL giữ lịch sử khi xoá bộ đề).';
```

> **Composite FK (Issue 16/11):** vì `user_id` trong answers giờ **phải** trỏ tới `(id, user_id)` của `quiz_attempts`, không có cách nào chèn answer với `user_id` lệch chủ attempt. Điều này thay thế nhu cầu thêm `EXISTS` vào `WITH CHECK` (giải quyết Issue 11 chặt hơn, ở tầng constraint thay vì tầng policy).

### 3.9. `flashcard_states` (SRS SM-2 — R5) + `review_logs`

```sql
-- 0004_tables_learning.sql
create table public.flashcard_states (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id)  on delete cascade,
  question_id      uuid not null references public.questions(id) on delete cascade,
  -- R5: đủ trường SM-2
  ease_factor      numeric(4,2) not null default 2.50,   -- init 2.5, min 1.3
  interval_days    int  not null default 0,
  repetitions      int  not null default 0,
  due_at           date not null default current_date,
  last_reviewed_at timestamptz,
  last_grade       smallint check (last_grade between 0 and 5),
  state            public.flashcard_state not null default 'new',   -- R5
  lapses           int  not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, question_id)
);
create index idx_flashcard_due   on public.flashcard_states (user_id, due_at);
create index idx_flashcard_state on public.flashcard_states (user_id, state);
create trigger trg_flashcard_updated_at before update on public.flashcard_states
  for each row execute function public.set_updated_at();

-- Log SRS bất biến (append-only) — RLS chỉ cho INSERT/SELECT own (Issue 9)
create table public.review_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id)  on delete cascade,
  question_id      uuid not null references public.questions(id) on delete cascade,
  grade            smallint not null check (grade between 0 and 5),
  prev_interval_days int,
  new_interval_days  int,
  prev_ease        numeric(4,2),
  new_ease         numeric(4,2),
  prev_state       public.flashcard_state,
  new_state        public.flashcard_state,
  reviewed_at      timestamptz not null default now()
);
create index idx_review_logs_user on public.review_logs (user_id, reviewed_at);

comment on column public.flashcard_states.state is
  'new/learning/review/relearning. new bị giới hạn theo profiles.daily_new_cards; queue "due" = state<>''new'' AND due_at<=today → tránh flood.';
```

### 3.10. `learning_paths` (+ `deleted_at`) + `learning_path_items` (+ `step_key` — Issue 5) + `learning_path_progress` (R1)

```sql
create table public.learning_paths (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  target_level public.level not null default 'junior',
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  deleted_at   timestamptz,                                     -- Issue 1
  -- FTS cho search-group theo Path (§2.7) — generated OK (cột own)
  search tsvector generated always as (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))
  ) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_learning_paths_search on public.learning_paths using gin (search);
create trigger trg_learning_paths_updated_at before update on public.learning_paths
  for each row execute function public.set_updated_at();

create table public.learning_path_items (
  id             uuid primary key default gen_random_uuid(),
  path_id        uuid not null references public.learning_paths(id) on delete cascade,
  item_type      public.path_item_type not null,               -- topic | quiz_set | question
  topic_id       uuid references public.topics(id)     on delete cascade,
  quiz_set_id    uuid references public.quiz_sets(id)  on delete cascade,
  question_id    uuid references public.questions(id)  on delete cascade,
  module_title   text,                                          -- gom nhóm "module" (free-text)
  step_key       text,                                          -- Issue 5: gom item cùng "step" (step-gate)
  title          text,                                          -- override nhãn (optional)
  sort_order     int  not null default 0,
  is_optional    boolean not null default false,
  pass_threshold smallint not null default 70 check (pass_threshold between 0 and 100),

  constraint chk_path_item_ref check (
    (item_type = 'topic'    and topic_id    is not null and quiz_set_id is null and question_id is null) or
    (item_type = 'quiz_set' and quiz_set_id is not null and topic_id    is null and question_id is null) or
    (item_type = 'question' and question_id is not null and topic_id    is null and quiz_set_id is null)
  )
);
create index idx_path_items_path on public.learning_path_items (path_id, sort_order);

-- R1: BẢNG MỚI — tiến độ lộ trình per (user, item)
create table public.learning_path_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  path_id      uuid not null references public.learning_paths(id) on delete cascade,  -- denormalize
  item_id      uuid not null references public.learning_path_items(id) on delete cascade,
  status       public.progress_status not null default 'not_started',
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, item_id)
);
create index idx_path_progress_user on public.learning_path_progress (user_id, path_id);
create trigger trg_path_progress_updated_at before update on public.learning_path_progress
  for each row execute function public.set_updated_at();

comment on column public.learning_path_items.step_key is
  'Issue 5: item cùng step_key thuộc 1 "step". Step completed = MỌI item non-optional cùng step_key đã completed. Unlock tuần tự per-step. sort_order phải liên tục trong cùng nhóm.';
comment on table public.learning_path_progress is
  'R1: unlock tuần tự = item available khi mọi step trước (item non-optional) đã completed. Resume = item available đầu tiên.';
```

### 3.11. `user_topic_progress` + `user_question_progress` + `bookmarks` + `user_activity`

```sql
-- Aggregate cache theo topic (dashboard "% theo chủ đề")
create table public.user_topic_progress (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  topic_id          uuid not null references public.topics(id)   on delete cascade,
  status            public.progress_status not null default 'not_started',
  questions_total   int not null default 0,
  questions_studied int not null default 0,
  mastery_percent   numeric(5,2) not null default 0,
  last_activity_at  timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, topic_id)
);
create index idx_topic_progress_user on public.user_topic_progress (user_id);
create trigger trg_topic_progress_updated_at before update on public.user_topic_progress
  for each row execute function public.set_updated_at();

-- BẢNG MỚI: trạng thái "đã hiểu" per câu (nguồn distinct "câu đã học")
create table public.user_question_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete cascade,
  understood      boolean not null default false,     -- client action "đánh dấu đã hiểu"
  correct_in_quiz boolean not null default false,     -- server-computed (Issue 8)
  understood_at   timestamptz,
  last_seen_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, question_id)
);
create index idx_user_question_progress_user on public.user_question_progress (user_id);
create trigger trg_user_question_progress_updated_at before update on public.user_question_progress
  for each row execute function public.set_updated_at();

create table public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id)  on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  note        text,
  created_at  timestamptz not null default now(),
  unique (user_id, question_id)
);
create index idx_bookmarks_user on public.bookmarks (user_id);

-- R5: nguồn streak + heatmap + recent activity. Append-only (RLS insert/select own — Issue 9)
create table public.user_activity (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  activity_type public.activity_type not null,       -- study | review | quiz | path
  ref_id        uuid,
  meta          jsonb,
  activity_date date not null default current_date,   -- cho streak & heatmap
  created_at    timestamptz not null default now()
);
create index idx_user_activity_day    on public.user_activity (user_id, activity_date);
create index idx_user_activity_recent on public.user_activity (user_id, created_at desc);

comment on table public.user_activity is
  'Event log append-only. Streak = số activity_date liên tiếp; heatmap = GROUP BY activity_date; recent = ORDER BY created_at.';
```

> **`user_question_progress` vs `user_topic_progress`:** `user_question_progress` = **nguồn chân lý** per-câu (đếm distinct "câu đã học" = `understood OR correct_in_quiz`); `user_topic_progress` = **cache aggregate** (Server Action/trigger cập nhật khi per-câu đổi) để dashboard đọc `%` nhanh.

---

## 4. Row Level Security (RLS)

### 4.1. RLS cho người mới (30 giây)

- Bật RLS mà **chưa có policy** ⇒ **chặn hết**. Phải viết policy để "mở cửa".
- `USING` = điều kiện thấy/tác động row (SELECT/UPDATE/DELETE). `WITH CHECK` = điều kiện row **mới** phải thỏa (INSERT/UPDATE).
- `auth.uid()` = id user đang đăng nhập. `service_role` key **bỏ qua toàn bộ RLS + column grants** → chỉ dùng ở server.
- **Hai tầng kiểm soát ghi:** RLS (row) **và** GRANT/REVOKE (column). Với các cột do server tính (`score`, `is_correct`, `correct_in_quiz`) → dùng **column-level GRANT** để client không ghi được (Issue 8).

### 4.2. Helper `is_admin()` — SECURITY DEFINER (tránh đệ quy RLS)

```sql
-- 0005_functions_triggers.sql
create or replace function public.is_admin()
returns boolean
language sql
security definer          -- bỏ qua RLS ⇒ không đệ quy khi policy profiles gọi hàm này
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```

> Trong policy gọi `(select public.is_admin())` và `(select auth.uid())` (bọc subselect) để Postgres tính **một lần/query** (initPlan) — best practice hiệu năng Supabase.

### 4.3. Bật RLS cho tất cả bảng

```sql
-- 0006_rls_policies.sql
alter table public.profiles                enable row level security;
alter table public.categories              enable row level security;
alter table public.topics                  enable row level security;
alter table public.tags                    enable row level security;
alter table public.question_tags           enable row level security;
alter table public.questions               enable row level security;
alter table public.quiz_sets               enable row level security;
alter table public.quiz_set_questions      enable row level security;
alter table public.quiz_attempts           enable row level security;
alter table public.quiz_attempt_answers    enable row level security;
alter table public.flashcard_states        enable row level security;
alter table public.review_logs             enable row level security;
alter table public.learning_paths          enable row level security;
alter table public.learning_path_items     enable row level security;
alter table public.learning_path_progress  enable row level security;
alter table public.user_topic_progress     enable row level security;
alter table public.user_question_progress  enable row level security;
alter table public.bookmarks               enable row level security;
alter table public.user_activity           enable row level security;
```

### 4.4. Policy `profiles` — chống privilege escalation cả UPDATE **và INSERT** (Issue 7, 3, 14)

> **Chốt (Issue 3/14):** **BỎ** `revoke update (role)` (nó chặn cả admin vì admin cũng là role `authenticated`; column-privilege kiểm tra trước RLS ⇒ `/admin/users` set-role qua client sẽ fail). Thay vào đó phòng thủ hoàn toàn bằng trigger `enforce_role_guard` (§5) + ràng buộc INSERT policy. Admin đổi role qua client giờ **chạy được**; non-admin bị chặn.

```sql
create policy "profiles_select_own_or_admin" on public.profiles
  for select using ( id = (select auth.uid()) or (select public.is_admin()) );

-- Issue 7: chặn escalation qua INSERT — self-insert BẮT BUỘC role='user'
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated
  with check ( id = (select auth.uid()) and role = 'user' );

create policy "profiles_update_own" on public.profiles
  for update using ( id = (select auth.uid()) ) with check ( id = (select auth.uid()) );

create policy "profiles_admin_all" on public.profiles
  for all using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );
```

> Admin tạo profile cho user khác: `profiles_admin_all` (permissive OR) cho phép dù `id <> auth.uid()` và `role='admin'`. Non-admin self-insert bị `role='user'` chặn escalation. Trigger `enforce_role_guard` (§5, BEFORE INSERT OR UPDATE) là lớp phòng thủ thứ hai.

### 4.5. Policy **nội dung học** (public read published & chưa xoá mềm / admin write)

Áp cho `categories`, `topics`, `questions`, `quiz_sets`, `learning_paths` — **tất cả** giờ có `deleted_at` (Issue 1).

```sql
-- questions
create policy "questions_public_read" on public.questions
  for select to public
  using ( (is_published = true and deleted_at is null) or (select public.is_admin()) );
create policy "questions_admin_write" on public.questions
  for all to authenticated
  using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );

-- categories (Issue 1: thêm deleted_at is null)
create policy "categories_public_read" on public.categories
  for select to public using ( (is_published = true and deleted_at is null) or (select public.is_admin()) );
create policy "categories_admin_write" on public.categories
  for all to authenticated using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );

-- topics (Issue 1)
create policy "topics_public_read" on public.topics
  for select to public using ( (is_published = true and deleted_at is null) or (select public.is_admin()) );
create policy "topics_admin_write" on public.topics
  for all to authenticated using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );

-- quiz_sets
create policy "quiz_sets_public_read" on public.quiz_sets
  for select to public using ( (is_published = true and deleted_at is null) or (select public.is_admin()) );
create policy "quiz_sets_admin_write" on public.quiz_sets
  for all to authenticated using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );

-- learning_paths (Issue 1)
create policy "learning_paths_public_read" on public.learning_paths
  for select to public using ( (is_published = true and deleted_at is null) or (select public.is_admin()) );
create policy "learning_paths_admin_write" on public.learning_paths
  for all to authenticated using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );
```

**Bảng junction — gate read theo trạng thái CHA (Issue 10/15)** — không leak composition của nội dung draft/đã xoá:

```sql
-- tags: vocab công khai, an toàn để lộ
create policy "tags_public_read"  on public.tags for select to public using ( true );
create policy "tags_admin_write"  on public.tags for all to authenticated
  using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );

-- question_tags: chỉ lộ nếu question cha đã publish & chưa xoá mềm
create policy "question_tags_public_read" on public.question_tags
  for select to public using (
    exists (select 1 from public.questions q
            where q.id = question_id and q.is_published and q.deleted_at is null)
    or (select public.is_admin())
  );
create policy "question_tags_admin_write" on public.question_tags
  for all to authenticated using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );

-- quiz_set_questions: gate theo quiz_sets cha
create policy "quiz_set_questions_public_read" on public.quiz_set_questions
  for select to public using (
    exists (select 1 from public.quiz_sets qs
            where qs.id = quiz_set_id and qs.is_published and qs.deleted_at is null)
    or (select public.is_admin())
  );
create policy "quiz_set_questions_admin_write" on public.quiz_set_questions
  for all to authenticated using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );

-- learning_path_items: gate theo learning_paths cha
create policy "learning_path_items_public_read" on public.learning_path_items
  for select to public using (
    exists (select 1 from public.learning_paths lp
            where lp.id = path_id and lp.is_published and lp.deleted_at is null)
    or (select public.is_admin())
  );
create policy "learning_path_items_admin_write" on public.learning_path_items
  for all to authenticated using ( (select public.is_admin()) ) with check ( (select public.is_admin()) );
```

### 4.6. Policy **dữ liệu cá nhân** — owner + **admin SELECT (R6)**

R6: **MỖI** bảng cá nhân có `*_admin_read` cho dashboard/analytics.

**Nhóm A — owner-all + admin-read** (`bookmarks`, `quiz_attempts`, `quiz_attempt_answers`, `flashcard_states`, `user_topic_progress`, `user_question_progress`, `learning_path_progress`):

```sql
create policy "flashcard_states_owner_all" on public.flashcard_states
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "flashcard_states_admin_read" on public.flashcard_states
  for select to authenticated using ( (select public.is_admin()) );

create policy "bookmarks_owner_all" on public.bookmarks
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "bookmarks_admin_read" on public.bookmarks
  for select to authenticated using ( (select public.is_admin()) );

create policy "quiz_attempts_owner_all" on public.quiz_attempts
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "quiz_attempts_admin_read" on public.quiz_attempts
  for select to authenticated using ( (select public.is_admin()) );

create policy "attempt_answers_owner_all" on public.quiz_attempt_answers
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "attempt_answers_admin_read" on public.quiz_attempt_answers
  for select to authenticated using ( (select public.is_admin()) );

create policy "topic_progress_owner_all" on public.user_topic_progress
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "topic_progress_admin_read" on public.user_topic_progress
  for select to authenticated using ( (select public.is_admin()) );

create policy "question_progress_owner_all" on public.user_question_progress
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "question_progress_admin_read" on public.user_question_progress
  for select to authenticated using ( (select public.is_admin()) );

create policy "path_progress_owner_all" on public.learning_path_progress
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "path_progress_admin_read" on public.learning_path_progress
  for select to authenticated using ( (select public.is_admin()) );
```

**Nhóm B — append-only: insert-own + select-own (KHÔNG UPDATE/DELETE) + admin-read** (`review_logs`, `user_activity` — Issue 9): chặn user sửa/xoá lịch sử SRS & gian lận streak.

```sql
create policy "review_logs_insert_own" on public.review_logs
  for insert to authenticated with check ( user_id = (select auth.uid()) );
create policy "review_logs_select_own" on public.review_logs
  for select to authenticated using ( user_id = (select auth.uid()) );
create policy "review_logs_admin_read" on public.review_logs
  for select to authenticated using ( (select public.is_admin()) );

create policy "user_activity_insert_own" on public.user_activity
  for insert to authenticated with check ( user_id = (select auth.uid()) );
create policy "user_activity_select_own" on public.user_activity
  for select to authenticated using ( user_id = (select auth.uid()) );
create policy "user_activity_admin_read" on public.user_activity
  for select to authenticated using ( (select public.is_admin()) );
```

### 4.7. Column-level GRANT/REVOKE — chống forge điểm/tiến độ (Issue 8, exam-integrity)

> **Gotcha Postgres:** column-level `REVOKE` **không có tác dụng** nếu role còn table-level privilege (table-level = mọi cột). Vì Supabase grant `ALL` cho `authenticated`, phải **REVOKE table-level trước, rồi GRANT lại đúng cột** cho phép. Các cột trust-sensitive (`score`, `correct_count`, `is_correct`, `correct_in_quiz`) chỉ ghi được bằng **service_role** (server-only, bypass grant).

```sql
-- quiz_attempts: client được START (INSERT) + đọc; SCORING/SUBMIT do service_role
revoke update, delete on public.quiz_attempts from authenticated;
--   ⇒ score, correct_count, status, completed_at… chỉ service_role sửa được.

-- quiz_attempt_answers: client autosave selected_keys; is_correct do server chấm
revoke insert, update, delete on public.quiz_attempt_answers from authenticated;
grant  insert (attempt_id, user_id, question_id, selected_keys, answered_at)
       on public.quiz_attempt_answers to authenticated;
grant  update (selected_keys, answered_at)
       on public.quiz_attempt_answers to authenticated;
--   is_correct: KHÔNG cấp ⇒ chỉ service_role.

-- user_question_progress: client set "understood"; correct_in_quiz do server
revoke insert, update, delete on public.user_question_progress from authenticated;
grant  insert (user_id, question_id, understood, understood_at, last_seen_at)
       on public.user_question_progress to authenticated;
grant  update (understood, understood_at, last_seen_at)
       on public.user_question_progress to authenticated;
--   correct_in_quiz: KHÔNG cấp ⇒ chỉ service_role (khi chấm quiz).
```

> `set_updated_at()` trigger vẫn set được `updated_at` dù client thiếu privilege cột đó — trigger ghi cột không bị kiểm tra theo quyền của caller. Các cột `id`/`created_at` dùng default nên không cần cấp INSERT.

### 4.8. Ma trận quyền cuối cùng

| Nhóm bảng | anon | user (chính chủ) | user (khác) | admin |
|---|---|---|---|---|
| Nội dung học (published, chưa xoá mềm) | đọc | đọc | đọc | đọc + ghi hết |
| Nội dung học (unpublished/deleted) | ✗ | ✗ | ✗ | đọc + ghi |
| Junction (draft cha) | ✗ | ✗ | ✗ | đọc + ghi |
| Cá nhân nhóm A | ✗ | đọc + ghi (trừ cột server-only) | ✗ | **đọc (R6)** |
| Cá nhân nhóm B (append-only) | ✗ | insert + đọc (không sửa/xoá) | ✗ | **đọc (R6)** |
| `profiles` | ✗ | đọc/sửa (không đổi `role`) | ✗ | toàn quyền |

---

## 5. Functions & triggers (0005)

### 5.1. `enforce_role_guard` — chống escalation cả INSERT lẫn UPDATE (Issue 7)

```sql
create or replace function public.enforce_role_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    -- Chỉ admin hiện hữu mới tạo profile role != 'user'
    if new.role is distinct from 'user' and not public.is_admin() then
      new.role := 'user';
    end if;
  elsif tg_op = 'UPDATE' then
    -- Non-admin không đổi được role (âm thầm giữ nguyên)
    if new.role is distinct from old.role and not public.is_admin() then
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_enforce_role_guard
  before insert or update on public.profiles
  for each row execute function public.enforce_role_guard();
```

### 5.2. `handle_new_user` — tạo profile khi có user mới

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name'),   -- Google trả 'name'
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;   -- idempotent
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

> `handle_new_user` chạy SECURITY DEFINER (owner, bypass RLS) → không vướng `profiles_insert_self`. Role mặc định `'user'`; `enforce_role_guard` xác nhận lại.

### 5.3. Search trigger — content + tag names (Issue 4)

```sql
-- Helper: build tsvector cho 1 question (content + tag names). STABLE (đọc question_tags)
-- ⇒ KHÔNG dùng generated column được (không immutable) — đây chính là lý do đổi sang trigger.
create or replace function public.build_question_search(p_prompt text, p_answer text, p_question_id uuid)
returns tsvector language sql stable set search_path = public as $$
  select to_tsvector('simple',
    coalesce(p_prompt,'') || ' ' || coalesce(p_answer,'') || ' ' ||
    coalesce((select string_agg(t.name, ' ')
              from public.question_tags qt join public.tags t on t.id = qt.tag_id
              where qt.question_id = p_question_id), ''));
$$;

-- (A) khi content đổi (fire on INSERT luôn; UPDATE chỉ khi prompt_md/answer_md đổi)
create or replace function public.questions_set_search()
returns trigger language plpgsql set search_path = public as $$
begin
  new.search := public.build_question_search(new.prompt_md, new.answer_md, new.id);
  return new;
end;
$$;
create trigger trg_questions_set_search
  before insert or update of prompt_md, answer_md on public.questions
  for each row execute function public.questions_set_search();

-- (B) khi gán/gỡ tag → refresh question liên quan (set cột 'search' ⇒ KHÔNG kích trigger A vì search không nằm trong OF list ⇒ không overlap/đệ quy)
create or replace function public.question_tags_refresh_search()
returns trigger language plpgsql set search_path = public as $$
declare qid uuid := coalesce(new.question_id, old.question_id);
begin
  update public.questions q
     set search = public.build_question_search(q.prompt_md, q.answer_md, q.id)
   where q.id = qid;
  return coalesce(new, old);
end;
$$;
create trigger trg_question_tags_refresh_search
  after insert or delete on public.question_tags
  for each row execute function public.question_tags_refresh_search();
```

> **Giới hạn đã biết:** đổi `tags.name` (đổi tên tag) không tự refresh `questions.search`. Tag name gần như bất biến; nếu cần, chạy backfill 1 lệnh `update questions set search = build_question_search(...)`. Không chặn MVP.

### 5.4. Cấp admin (⚠️ THỦ CÔNG — SQL Editor / service_role)

```sql
update public.profiles set role = 'admin' where email = 'nhatlenguyen843@gmail.com';
```

---

## 6. Ghi chú — CUSTOM QUIZ + SRS/streak + defer

### 6.1. CUSTOM QUIZ chạy được (R1)

**Ad-hoc → attempt → answers (không cần row trong `quiz_sets`):**

1. `/quiz/new`: user chọn `topics[]`, `level`, khoảng `difficulty`, số câu, timed. Server Action chọn câu:
   ```sql
   select id from public.questions
   where type = 'quiz' and is_published and deleted_at is null
     and topic_id = any($1) and level = $2
     and difficulty between $3 and $4
   order by random() limit $5;   -- hoặc seeded để reproducible
   ```
2. Tạo attempt custom (R1 — `quiz_set_id` NULL):
   ```sql
   insert into public.quiz_attempts
     (user_id, quiz_source, quiz_set_id, config, question_ids, status, total_questions)
   values ($uid, 'custom', null,
           '{"topics":["react"],"level":"mid","difficulty":[2,4],"count":10,"timed":true}'::jsonb,
           $selected_ids, 'in_progress', 10)
   returning id;
   ```
   `chk_custom_no_set` cho phép vì `custom AND quiz_set_id IS NULL`.
3. Autosave: client `insert … on conflict (attempt_id, question_id) do update set selected_keys=…` (chỉ `selected_keys`/`answered_at` — cột được GRANT).
4. **Nộp bài (service_role):** server chấm (`selected_keys` vs `questions.correct_keys`) → `update quiz_attempts set status='completed', score, correct_count, completed_at, duration_sec` + `update quiz_attempt_answers set is_correct` (các cột này client không ghi được — Issue 8).
5. Câu đúng → server `upsert user_question_progress set correct_in_quiz=true`; `insert user_activity('quiz')`.

**Preset** dùng **cùng bảng** `quiz_attempts`: `quiz_source='preset'`, `quiz_set_id`=id bộ đề, `question_ids` từ `quiz_set_questions`. Một bảng phục vụ cả hai → hết mâu thuẫn `quiz_sessions` vs `quiz_attempts`.

### 6.2. SRS lấy dữ liệu từ đâu (R5)

- **State per card:** `flashcard_states` (đủ `ease_factor`, `interval_days`, `repetitions`, `due_at`, `last_reviewed_at`, `last_grade`, `state`, `lapses`).
- **Queue `/review`:** (a) due = `state IN ('learning','review','relearning') AND due_at <= current_date ORDER BY due_at`; (b) new = `state='new'` **giới hạn `profiles.daily_new_cards`** → không flood.
- **Mỗi lần đánh giá:** `computeNextReview(state, grade)` → `upsert flashcard_states` + `insert review_logs` (append-only) + `insert user_activity('review')`.
- **Stats:** `GROUP BY state`; `mastered = interval_days >= 21`.

```ts
type FlashcardState = {
  ease_factor: number; interval_days: number; repetitions: number;
  due_at: string; state: 'new' | 'learning' | 'review' | 'relearning'; lapses: number;
};
export function computeNextReview(s: FlashcardState, grade: 0|3|4|5): FlashcardState { /* SM-2 */ }
```

### 6.3. Streak / activity (R5)

- **Nguồn:** `user_activity` (append-only; mỗi hành động 1 row + `activity_date`).
- **Streak:** khi ghi activity, Server Action cập nhật `profiles`: `last_active_date=today`→giữ; `=yesterday`→`current_streak+=1`; khác→reset `=1`; `longest_streak=max(...)`. Counters là cache, luôn recompute được từ `user_activity`.
- **Heatmap:** `group by activity_date`. **Recent:** `order by created_at desc`.
- **"Câu đã học":** `count(*) from user_question_progress where user_id=$uid and (understood or correct_in_quiz)`.
- **% theo topic:** đọc `user_topic_progress.mastery_percent` (cache, cập nhật khi `user_question_progress` đổi).

### 6.4. Defer khỏi MVP (Issue 6 — MoSCoW; KHÔNG build ở MVP)

Không có trong (a)–(g); build sau, tính được từ dữ liệu sẵn có:
- **Badges:** `user_badges(user_id, badge_key, earned_at, unique(user_id, badge_key))` — tính từ `user_activity`/streak.
- **Notifications/SRS reminder:** `notification_preferences(user_id, …)` + `reminder_queue(user_id, due_at, channel, status)`.

---

## 7. Nhật ký reconcile 17 issue (đã áp dụng / bỏ qua + lý do)

| # | Loại · mức | Xử lý |
|---|---|---|
| 1 | feature · **major** | **ÁP DỤNG.** Thêm `deleted_at` cho categories/topics/learning_paths; `topics.category_id` & `questions.topic_id` → `ON DELETE RESTRICT` (cắt cascade catastrophe); `public_read` + published index thêm `deleted_at is null`. *Không* đổi `learning_path_items.*` sang restrict: chuỗi cascade đã bị chặn tại 2 FK top nên item không còn bị mass-cascade; giữ cascade để edit path gọn. |
| 2 | feature · minor | **ÁP DỤNG.** `answer_md` NULLable (cho draft) + `chk_published_needs_answer` (published bắt buộc có đáp án). "Thiếu đáp án" = `answer_md is null or btrim(answer_md)=''`. |
| 3 | feature · minor | **ÁP DỤNG** (gộp #14). Bỏ `revoke update(role)`; dựa vào `enforce_role_guard` → `/admin/users` set-role qua client chạy được. |
| 4 | feature · minor | **ÁP DỤNG.** `questions.search` → trigger-maintained (content + tag names) qua `build_question_search` + trigger trên questions & question_tags. Thêm `search` generated cho topics & learning_paths (grouped search §2.7). Giới hạn: đổi `tags.name` cần backfill. |
| 5 | feature · minor | **ÁP DỤNG (nhẹ).** Thêm `step_key text` vào `learning_path_items` cho step-gate; giữ mô hình flat + `learning_path_progress`. Đủ cho MVP tuần tự per-item/per-step. |
| 6 | feature · minor | **DEFER (theo khuyến nghị).** Không build `user_badges`/notification ở MVP (Could-have, ngoài a–g). Ghi sketch §6.4. |
| 7 | security · **blocker** | **ÁP DỤNG.** `profiles_insert_self` ràng `role='user'`; `enforce_role_guard` mở rộng BEFORE **INSERT OR UPDATE** (defense-in-depth). Đóng lỗ INSERT-escalation. |
| 8 | security · **major** | **ÁP DỤNG.** Column-level GRANT (revoke table-level → grant cột an toàn) cho `quiz_attempts`/`quiz_attempt_answers`/`user_question_progress`: `score`/`correct_count`/`is_correct`/`correct_in_quiz` chỉ service_role ghi. |
| 9 | security · minor | **ÁP DỤNG.** `review_logs` & `user_activity` đổi owner_all → insert-own + select-own (bỏ UPDATE/DELETE); giữ admin_read. |
| 10 | security · minor | **ÁP DỤNG** (gộp #15). Junction `public_read` gate bằng `EXISTS` trạng thái cha (published & chưa xoá mềm). |
| 11 | security · minor | **ÁP DỤNG (qua #16).** Composite FK `(attempt_id,user_id)→quiz_attempts(id,user_id)` ép sở hữu attempt ở tầng DB → mạnh hơn `EXISTS` trong WITH CHECK; bỏ EXISTS vì thừa. |
| 12 | sql · **major** | **ÁP DỤNG.** `chk_quiz_shape` dùng `coalesce(cardinality(correct_keys),0) >= 1` (array rỗng → 0, không lọt NULL). |
| 13 | sql · minor | **ÁP DỤNG.** `question_tags` đặt ngay sau `questions` (§3.6) trong 0002. |
| 14 | sql · minor | **ÁP DỤNG** (gộp #3). Bỏ `revoke update(role)`, dựa `enforce_role_guard`. |
| 15 | sql · minor | **ÁP DỤNG** (gộp #10). |
| 16 | sql · minor | **ÁP DỤNG.** `quiz_attempts unique(id,user_id)` + composite FK trên `quiz_attempt_answers`. |
| 17 | sql · minor | **ÁP DỤNG.** Thứ tự migration ghi rõ `set_updated_at` ở **0001** (§0), tách khỏi 0005. |

**Tất cả 17 issue đã đóng.** Không issue nào bị bỏ qua vì "không hợp lý"; #6 defer đúng theo MoSCoW của chính reviewer, #11 hấp thụ vào #16 (mạnh hơn).

## Tóm tắt blocker

- **R1** ✅ `quiz_attempts.quiz_set_id` NULLABLE + `quiz_source` + `chk_custom_no_set`; **`learning_path_progress`** (bảng mới).
- **R2** ✅ Một bộ tên chuẩn duy nhất (§1.1) — không còn tên lệch.
- **R3** ✅ `question_type` (5 kind) ⟂ `answer_format`; `level` ⟂ `difficulty smallint 1..5`; thêm `frequency smallint 1..5`.
- **R5** ✅ `flashcard_states` đủ SM-2 + `state`/`lapses`; `review_logs`; `user_activity` + streak counters.
- **R6** ✅ `*_admin_read` trên **mọi** bảng cá nhân.
- **R7** ✅ `questions.slug` + mọi slug taxonomy `NOT NULL UNIQUE`.
- **Song ngữ** ✅ Content = 1 field markdown (VI giữ term EN); i18n UI ở frontend, không lưu DB.


---

# 📐 TypeScript Types (mirror của schema)

> Bản viết tay build-ready. Khi có Supabase project thật, chạy `npx supabase gen types typescript --linked > src/types/database.types.ts` để thay thế phần Database types.

Đây là deliverable — TypeScript types build-ready sinh từ SCHEMA CUỐI CÙNG. Schema tự đủ (self-contained) nên không cần đọc thêm file nào. Trả về dưới dạng Markdown chứa code TypeScript, chia 2 file: `src/types/database.types.ts` (bản viết tay chuẩn `supabase gen types`) và `src/types/domain.ts` (domain enums + mapping).

---

# FE Interview Prep — TypeScript Types (Build-Ready)

Sinh tay từ schema thống nhất, khớp 1:1 output của `supabase gen types typescript`. Quy ước ánh xạ Postgres → TS: `uuid|text|date|timestamptz → string`, `int|smallint|numeric → number`, `boolean → boolean`, `jsonb → Json`, `text[]|uuid[] → string[]`, `enum → Database['public']['Enums'][...]`, `tsvector → unknown`. Cột có `DEFAULT` hoặc `NULL` → **optional** trong `Insert`; `Update` mọi cột optional; cột `GENERATED ALWAYS` (`topics.search`, `learning_paths.search`) chỉ có trong `Row`.

---

## 1. `src/types/database.types.ts`

> Bản viết tay này thay thế được bằng generator thật khi có DB (xem §4). Dùng `export type Database` (đúng như generator sinh ra — không phải `interface`); shape `public.Tables` / `public.Enums` giữ nguyên như yêu cầu.

```typescript
// src/types/database.types.ts
// -----------------------------------------------------------------------------
// Hand-written to mirror `supabase gen types typescript` output 1:1.
// Single source of truth = "Unified Postgres/Supabase Schema (Build-Ready v2)".
// Replace with the generated file once the DB exists (see project README / §4).
// -----------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // ---------------------------------------------------------------- profiles
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          locale: string
          theme: string
          daily_new_cards: number
          streak_goal: number | null
          current_streak: number
          longest_streak: number
          last_active_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string // FK → auth.users(id); no default → required
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          locale?: string
          theme?: string
          daily_new_cards?: number
          streak_goal?: number | null
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          locale?: string
          theme?: string
          daily_new_cards?: number
          streak_goal?: number | null
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      // -------------------------------------------------------------- categories
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          sort_order: number
          is_published: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_published?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_published?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // ------------------------------------------------------------------ topics
      topics: {
        Row: {
          id: string
          category_id: string
          slug: string
          name: string
          description: string | null
          level: Database["public"]["Enums"]["level"]
          sort_order: number
          is_published: boolean
          deleted_at: string | null
          search: unknown // tsvector, GENERATED ALWAYS — read-only
          created_at: string
          updated_at: string
        }
        Insert: {
          // NOTE: `search` is a generated column → omitted from Insert/Update.
          id?: string
          category_id: string
          slug: string
          name: string
          description?: string | null
          level?: Database["public"]["Enums"]["level"]
          sort_order?: number
          is_published?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          slug?: string
          name?: string
          description?: string | null
          level?: Database["public"]["Enums"]["level"]
          sort_order?: number
          is_published?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      // -------------------------------------------------------------------- tags
      tags: {
        Row: {
          id: string
          slug: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      // ---------------------------------------------------------- question_tags
      question_tags: {
        Row: {
          question_id: string
          tag_id: string
        }
        Insert: {
          question_id: string
          tag_id: string
        }
        Update: {
          question_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      // --------------------------------------------------------------- questions
      questions: {
        Row: {
          id: string
          slug: string
          topic_id: string
          subtopic: string | null
          type: Database["public"]["Enums"]["question_type"]
          answer_format: Database["public"]["Enums"]["answer_format"] | null
          level: Database["public"]["Enums"]["level"]
          difficulty: number // smallint, CHECK 1..5
          frequency: number // smallint, CHECK 1..5
          estimated_time_sec: number | null
          prompt_md: string
          answer_md: string | null
          options: Json | null
          correct_keys: string[] | null
          code_snippet: string | null
          code_language: string | null
          reference_links: Json | null
          companies: string[] | null
          related_question_ids: string[] | null
          is_deprecated: boolean
          is_published: boolean
          deleted_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          search: unknown | null // tsvector, trigger-maintained
        }
        Insert: {
          id?: string
          slug: string
          topic_id: string
          subtopic?: string | null
          type: Database["public"]["Enums"]["question_type"] // no default → required
          answer_format?: Database["public"]["Enums"]["answer_format"] | null
          level?: Database["public"]["Enums"]["level"]
          difficulty?: number
          frequency?: number
          estimated_time_sec?: number | null
          prompt_md: string
          answer_md?: string | null
          options?: Json | null
          correct_keys?: string[] | null
          code_snippet?: string | null
          code_language?: string | null
          reference_links?: Json | null
          companies?: string[] | null
          related_question_ids?: string[] | null
          is_deprecated?: boolean
          is_published?: boolean
          deleted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          search?: unknown | null // set by trigger; app never writes this
        }
        Update: {
          id?: string
          slug?: string
          topic_id?: string
          subtopic?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          answer_format?: Database["public"]["Enums"]["answer_format"] | null
          level?: Database["public"]["Enums"]["level"]
          difficulty?: number
          frequency?: number
          estimated_time_sec?: number | null
          prompt_md?: string
          answer_md?: string | null
          options?: Json | null
          correct_keys?: string[] | null
          code_snippet?: string | null
          code_language?: string | null
          reference_links?: Json | null
          companies?: string[] | null
          related_question_ids?: string[] | null
          is_deprecated?: boolean
          is_published?: boolean
          deleted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          search?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // --------------------------------------------------------------- quiz_sets
      quiz_sets: {
        Row: {
          id: string
          slug: string
          category_id: string | null
          title: string
          description: string | null
          level: Database["public"]["Enums"]["level"]
          time_limit_sec: number | null
          pass_score: number
          is_published: boolean
          deleted_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          category_id?: string | null
          title: string
          description?: string | null
          level?: Database["public"]["Enums"]["level"]
          time_limit_sec?: number | null
          pass_score?: number
          is_published?: boolean
          deleted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          category_id?: string | null
          title?: string
          description?: string | null
          level?: Database["public"]["Enums"]["level"]
          time_limit_sec?: number | null
          pass_score?: number
          is_published?: boolean
          deleted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_sets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // ------------------------------------------------------ quiz_set_questions
      quiz_set_questions: {
        Row: {
          id: string
          quiz_set_id: string
          question_id: string
          sort_order: number
          points: number
        }
        Insert: {
          id?: string
          quiz_set_id: string
          question_id: string
          sort_order?: number
          points?: number
        }
        Update: {
          id?: string
          quiz_set_id?: string
          question_id?: string
          sort_order?: number
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_set_questions_quiz_set_id_fkey"
            columns: ["quiz_set_id"]
            isOneToOne: false
            referencedRelation: "quiz_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_set_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      // ------------------------------------------------------------ quiz_attempts
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_source: Database["public"]["Enums"]["quiz_source"]
          quiz_set_id: string | null
          config: Json | null
          question_ids: string[]
          status: Database["public"]["Enums"]["attempt_status"]
          score: number | null
          correct_count: number | null
          total_questions: number | null
          duration_sec: number | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          quiz_source: Database["public"]["Enums"]["quiz_source"] // no default → required
          quiz_set_id?: string | null
          config?: Json | null
          question_ids?: string[]
          status?: Database["public"]["Enums"]["attempt_status"]
          score?: number | null // server-only (column GRANT); typed for service_role
          correct_count?: number | null
          total_questions?: number | null
          duration_sec?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          quiz_source?: Database["public"]["Enums"]["quiz_source"]
          quiz_set_id?: string | null
          config?: Json | null
          question_ids?: string[]
          status?: Database["public"]["Enums"]["attempt_status"]
          score?: number | null
          correct_count?: number | null
          total_questions?: number | null
          duration_sec?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_set_id_fkey"
            columns: ["quiz_set_id"]
            isOneToOne: false
            referencedRelation: "quiz_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      // ----------------------------------------------------- quiz_attempt_answers
      quiz_attempt_answers: {
        Row: {
          id: string
          attempt_id: string
          user_id: string
          question_id: string
          selected_keys: string[]
          is_correct: boolean | null
          answered_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          user_id: string
          question_id: string
          selected_keys?: string[]
          is_correct?: boolean | null // server-only (column GRANT)
          answered_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          user_id?: string
          question_id?: string
          selected_keys?: string[]
          is_correct?: boolean | null
          answered_at?: string
        }
        Relationships: [
          {
            // Composite FK (Issue 16/11): (attempt_id,user_id) → quiz_attempts(id,user_id)
            foreignKeyName: "quiz_attempt_answers_attempt_id_user_id_fkey"
            columns: ["attempt_id", "user_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "quiz_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      // ------------------------------------------------------- flashcard_states
      flashcard_states: {
        Row: {
          id: string
          user_id: string
          question_id: string
          ease_factor: number
          interval_days: number
          repetitions: number
          due_at: string
          last_reviewed_at: string | null
          last_grade: number | null
          state: Database["public"]["Enums"]["flashcard_state"]
          lapses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          due_at?: string
          last_reviewed_at?: string | null
          last_grade?: number | null
          state?: Database["public"]["Enums"]["flashcard_state"]
          lapses?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          due_at?: string
          last_reviewed_at?: string | null
          last_grade?: number | null
          state?: Database["public"]["Enums"]["flashcard_state"]
          lapses?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_states_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      // ------------------------------------------------------------- review_logs
      review_logs: {
        Row: {
          id: string
          user_id: string
          question_id: string
          grade: number
          prev_interval_days: number | null
          new_interval_days: number | null
          prev_ease: number | null
          new_ease: number | null
          prev_state: Database["public"]["Enums"]["flashcard_state"] | null
          new_state: Database["public"]["Enums"]["flashcard_state"] | null
          reviewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          grade: number // no default → required
          prev_interval_days?: number | null
          new_interval_days?: number | null
          prev_ease?: number | null
          new_ease?: number | null
          prev_state?: Database["public"]["Enums"]["flashcard_state"] | null
          new_state?: Database["public"]["Enums"]["flashcard_state"] | null
          reviewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          grade?: number
          prev_interval_days?: number | null
          new_interval_days?: number | null
          prev_ease?: number | null
          new_ease?: number | null
          prev_state?: Database["public"]["Enums"]["flashcard_state"] | null
          new_state?: Database["public"]["Enums"]["flashcard_state"] | null
          reviewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_logs_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      // --------------------------------------------------------- learning_paths
      learning_paths: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          target_level: Database["public"]["Enums"]["level"]
          sort_order: number
          is_published: boolean
          deleted_at: string | null
          search: unknown // tsvector, GENERATED ALWAYS — read-only
          created_at: string
          updated_at: string
        }
        Insert: {
          // NOTE: `search` is a generated column → omitted.
          id?: string
          slug: string
          title: string
          description?: string | null
          target_level?: Database["public"]["Enums"]["level"]
          sort_order?: number
          is_published?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          target_level?: Database["public"]["Enums"]["level"]
          sort_order?: number
          is_published?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // ---------------------------------------------------- learning_path_items
      learning_path_items: {
        Row: {
          id: string
          path_id: string
          item_type: Database["public"]["Enums"]["path_item_type"]
          topic_id: string | null
          quiz_set_id: string | null
          question_id: string | null
          module_title: string | null
          step_key: string | null
          title: string | null
          sort_order: number
          is_optional: boolean
          pass_threshold: number
        }
        Insert: {
          id?: string
          path_id: string
          item_type: Database["public"]["Enums"]["path_item_type"] // no default → required
          topic_id?: string | null
          quiz_set_id?: string | null
          question_id?: string | null
          module_title?: string | null
          step_key?: string | null
          title?: string | null
          sort_order?: number
          is_optional?: boolean
          pass_threshold?: number
        }
        Update: {
          id?: string
          path_id?: string
          item_type?: Database["public"]["Enums"]["path_item_type"]
          topic_id?: string | null
          quiz_set_id?: string | null
          question_id?: string | null
          module_title?: string | null
          step_key?: string | null
          title?: string | null
          sort_order?: number
          is_optional?: boolean
          pass_threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_items_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_items_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_items_quiz_set_id_fkey"
            columns: ["quiz_set_id"]
            isOneToOne: false
            referencedRelation: "quiz_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      // ------------------------------------------------- learning_path_progress
      learning_path_progress: {
        Row: {
          id: string
          user_id: string
          path_id: string
          item_id: string
          status: Database["public"]["Enums"]["progress_status"]
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          path_id: string
          item_id: string
          status?: Database["public"]["Enums"]["progress_status"]
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          path_id?: string
          item_id?: string
          status?: Database["public"]["Enums"]["progress_status"]
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_progress_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "learning_path_items"
            referencedColumns: ["id"]
          },
        ]
      }
      // -------------------------------------------------- user_topic_progress
      user_topic_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          status: Database["public"]["Enums"]["progress_status"]
          questions_total: number
          questions_studied: number
          mastery_percent: number
          last_activity_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          status?: Database["public"]["Enums"]["progress_status"]
          questions_total?: number
          questions_studied?: number
          mastery_percent?: number
          last_activity_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          status?: Database["public"]["Enums"]["progress_status"]
          questions_total?: number
          questions_studied?: number
          mastery_percent?: number
          last_activity_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_topic_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      // ----------------------------------------------- user_question_progress
      user_question_progress: {
        Row: {
          id: string
          user_id: string
          question_id: string
          understood: boolean
          correct_in_quiz: boolean
          understood_at: string | null
          last_seen_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          understood?: boolean
          correct_in_quiz?: boolean // server-only (column GRANT)
          understood_at?: string | null
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          understood?: boolean
          correct_in_quiz?: boolean
          understood_at?: string | null
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      // ----------------------------------------------------------------- bookmarks
      bookmarks: {
        Row: {
          id: string
          user_id: string
          question_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      // ------------------------------------------------------------- user_activity
      user_activity: {
        Row: {
          id: string
          user_id: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          ref_id: string | null
          meta: Json | null
          activity_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: Database["public"]["Enums"]["activity_type"] // no default → required
          ref_id?: string | null
          meta?: Json | null
          activity_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          ref_id?: string | null
          meta?: Json | null
          activity_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      question_type: "theory" | "coding" | "quiz" | "system-design" | "behavioral"
      level: "junior" | "mid" | "senior"
      answer_format: "single_choice" | "multiple_choice" | "true_false"
      quiz_source: "preset" | "custom"
      user_role: "user" | "admin"
      attempt_status: "in_progress" | "completed" | "abandoned"
      progress_status: "not_started" | "in_progress" | "completed"
      path_item_type: "topic" | "quiz_set" | "question"
      flashcard_state: "new" | "learning" | "review" | "relearning"
      activity_type: "study" | "review" | "quiz" | "path"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// -----------------------------------------------------------------------------
// Generic helpers (identical to those `supabase gen types` appends).
// -----------------------------------------------------------------------------
type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]

// Const object mirroring the DB enum values (handy for zod / dropdowns).
export const Constants = {
  public: {
    Enums: {
      question_type: ["theory", "coding", "quiz", "system-design", "behavioral"],
      level: ["junior", "mid", "senior"],
      answer_format: ["single_choice", "multiple_choice", "true_false"],
      quiz_source: ["preset", "custom"],
      user_role: ["user", "admin"],
      attempt_status: ["in_progress", "completed", "abandoned"],
      progress_status: ["not_started", "in_progress", "completed"],
      path_item_type: ["topic", "quiz_set", "question"],
      flashcard_state: ["new", "learning", "review", "relearning"],
      activity_type: ["study", "review", "quiz", "path"],
    },
  },
} as const
```

---

## 2. `src/types/domain.ts` — domain enums, scalars, mapping

App layer dùng union hẹp (không phải `string`) + narrow các cột `number` (difficulty/frequency) và `Json` (options) mà generated types để lỏng. `as const satisfies readonly Enums<'...'>[]` cho **compile-time guarantee** runtime array khớp DB enum — sai lệch tên = lỗi build.

```typescript
// src/types/domain.ts
import type { Database, Enums, Tables, TablesInsert, TablesUpdate } from "./database.types"

// -----------------------------------------------------------------------------
// 1) Enum unions — derived from the generated schema (single source of truth),
//    paired with runtime arrays proven-equal via `satisfies`.
// -----------------------------------------------------------------------------
export type QuestionType = Enums<"question_type">
export type Level = Enums<"level">
export type AnswerFormat = Enums<"answer_format">
export type QuizSource = Enums<"quiz_source">
export type UserRole = Enums<"user_role">
export type AttemptStatus = Enums<"attempt_status">
export type ProgressStatus = Enums<"progress_status">
export type PathItemType = Enums<"path_item_type">
export type CardState = Enums<"flashcard_state"> // 'new' | 'learning' | 'review' | 'relearning'
export type ActivityType = Enums<"activity_type">

export const QUESTION_TYPES = ["theory", "coding", "quiz", "system-design", "behavioral"] as const satisfies readonly QuestionType[]
export const LEVELS = ["junior", "mid", "senior"] as const satisfies readonly Level[]
export const ANSWER_FORMATS = ["single_choice", "multiple_choice", "true_false"] as const satisfies readonly AnswerFormat[]
export const QUIZ_SOURCES = ["preset", "custom"] as const satisfies readonly QuizSource[]
export const USER_ROLES = ["user", "admin"] as const satisfies readonly UserRole[]
export const ATTEMPT_STATUSES = ["in_progress", "completed", "abandoned"] as const satisfies readonly AttemptStatus[]
export const PROGRESS_STATUSES = ["not_started", "in_progress", "completed"] as const satisfies readonly ProgressStatus[]
export const PATH_ITEM_TYPES = ["topic", "quiz_set", "question"] as const satisfies readonly PathItemType[]
export const CARD_STATES = ["new", "learning", "review", "relearning"] as const satisfies readonly CardState[]
export const ACTIVITY_TYPES = ["study", "review", "quiz", "path"] as const satisfies readonly ActivityType[]

// -----------------------------------------------------------------------------
// 2) Scalar refinements — DB stores these as smallint (typed `number`);
//    the domain narrows to the CHECK-constrained ranges.
// -----------------------------------------------------------------------------
export type Difficulty = 1 | 2 | 3 | 4 | 5 // questions.difficulty  CHECK 1..5
export type Frequency = 1 | 2 | 3 | 4 | 5 // questions.frequency   CHECK 1..5
export type Grade = 0 | 1 | 2 | 3 | 4 | 5 // review_logs.grade / flashcard_states.last_grade

export const DIFFICULTIES = [1, 2, 3, 4, 5] as const satisfies readonly Difficulty[]
export const FREQUENCIES = [1, 2, 3, 4, 5] as const satisfies readonly Frequency[]
export const GRADES = [0, 1, 2, 3, 4, 5] as const satisfies readonly Grade[]

/** Clamp+round any number into the 1..5 scale (difficulty / frequency). */
export function asScale5(n: number): Difficulty {
  return Math.min(5, Math.max(1, Math.round(n))) as Difficulty
}
export function isCardState(v: string): v is CardState {
  return (CARD_STATES as readonly string[]).includes(v)
}

// -----------------------------------------------------------------------------
// 3) Shape of the `options` jsonb on questions (see schema §3.5).
// -----------------------------------------------------------------------------
export interface QuizOption {
  key: string // 'a' | 'b' | ...
  text: string
  explanation?: string
}

// -----------------------------------------------------------------------------
// 4) Row / Insert / Update aliases (per-table shortcuts over the generic helpers)
// -----------------------------------------------------------------------------
export type ProfileRow = Tables<"profiles">
export type ProfileInsert = TablesInsert<"profiles">
export type ProfileUpdate = TablesUpdate<"profiles">

export type CategoryRow = Tables<"categories">
export type TopicRow = Tables<"topics">
export type TagRow = Tables<"tags">

export type QuestionRow = Tables<"questions">
export type QuestionInsert = TablesInsert<"questions">
export type QuestionUpdate = TablesUpdate<"questions">

export type QuizSetRow = Tables<"quiz_sets">
export type QuizSetQuestionRow = Tables<"quiz_set_questions">
export type QuizAttemptRow = Tables<"quiz_attempts">
export type QuizAttemptInsert = TablesInsert<"quiz_attempts">
export type QuizAttemptAnswerRow = Tables<"quiz_attempt_answers">

export type FlashcardStateRow = Tables<"flashcard_states">
export type FlashcardStateInsert = TablesInsert<"flashcard_states">
export type ReviewLogRow = Tables<"review_logs">

export type LearningPathRow = Tables<"learning_paths">
export type LearningPathItemRow = Tables<"learning_path_items">
export type LearningPathProgressRow = Tables<"learning_path_progress">

export type UserTopicProgressRow = Tables<"user_topic_progress">
export type UserQuestionProgressRow = Tables<"user_question_progress">
export type BookmarkRow = Tables<"bookmarks">
export type UserActivityRow = Tables<"user_activity">

// -----------------------------------------------------------------------------
// 5) Domain models — the app-facing, camelCase, fully-narrowed shapes.
// -----------------------------------------------------------------------------
export interface Question {
  id: string
  slug: string
  topicId: string
  subtopic: string | null
  type: QuestionType
  answerFormat: AnswerFormat | null
  level: Level
  difficulty: Difficulty // narrowed from number
  frequency: Frequency // narrowed from number
  estimatedTimeSec: number | null
  promptMd: string
  answerMd: string | null
  options: QuizOption[] | null // parsed from Json
  correctKeys: string[] | null
  codeSnippet: string | null
  codeLanguage: string | null
  companies: string[] | null
  relatedQuestionIds: string[] | null
  isPublished: boolean
  isDeprecated: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

/** SRS card projection (schema §6.2 `computeNextReview` operates on this). */
export interface Flashcard {
  id: string
  questionId: string
  easeFactor: number
  intervalDays: number
  repetitions: number
  dueAt: string
  lastReviewedAt: string | null
  lastGrade: Grade | null
  state: CardState
  lapses: number
}

// -----------------------------------------------------------------------------
// 6) Mappers: generated Row (snake_case, loose) → domain model (camelCase, narrow)
// -----------------------------------------------------------------------------
export function toQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    slug: row.slug,
    topicId: row.topic_id,
    subtopic: row.subtopic,
    type: row.type,
    answerFormat: row.answer_format,
    level: row.level,
    difficulty: asScale5(row.difficulty),
    frequency: asScale5(row.frequency),
    estimatedTimeSec: row.estimated_time_sec,
    promptMd: row.prompt_md,
    answerMd: row.answer_md,
    // `options` is `Json | null`; the app guarantees the [{key,text,explanation}] shape.
    options: (row.options as unknown as QuizOption[] | null) ?? null,
    correctKeys: row.correct_keys,
    codeSnippet: row.code_snippet,
    codeLanguage: row.code_language,
    companies: row.companies,
    relatedQuestionIds: row.related_question_ids,
    isPublished: row.is_published,
    isDeprecated: row.is_deprecated,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toFlashcard(row: FlashcardStateRow): Flashcard {
  return {
    id: row.id,
    questionId: row.question_id,
    easeFactor: row.ease_factor,
    intervalDays: row.interval_days,
    repetitions: row.repetitions,
    dueAt: row.due_at,
    lastReviewedAt: row.last_reviewed_at,
    lastGrade: (row.last_grade as Grade | null),
    state: row.state,
    lapses: row.lapses,
  }
}

// -----------------------------------------------------------------------------
// 7) Custom-quiz config (quiz_attempts.config jsonb, schema §6.1). Not in DB
//    types because jsonb is opaque — validate at the Server Action boundary.
// -----------------------------------------------------------------------------
export interface CustomQuizConfig {
  topics: string[] // topic slugs or ids
  level: Level
  difficulty: [min: Difficulty, max: Difficulty]
  count: number
  timed: boolean
  seed?: number
}
```

---

## 3. Cách dùng (client typed)

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
// → mọi .from('questions').select() được suy kiểu Row đầy đủ + join theo Relationships.
```

Điểm type-safety load-bearing:
- `type`, `answer_format`, `level`, `state`, `status`... đều là **enum union** (không phải `string`) — sai giá trị = lỗi compile.
- `difficulty`/`frequency` ở DB là `number` (smallint) → domain narrow về `1..5` qua `asScale5()`; đừng để `number` rò rỉ vào UI.
- Cột server-only (`score`, `correct_count`, `is_correct`, `correct_in_quiz`) vẫn optional trong `Insert` (đúng shape schema), nhưng client bị chặn ghi ở tầng **column GRANT** (Issue 8) — chỉ `service_role` set. Type không thay quyền DB.
- `quiz_attempts.quiz_set_id: string | null` + `quiz_source` khớp R1 (custom quiz = `quiz_set_id` null).

---

## 4. Khi có DB thật — thay bằng generator

```bash
# Link project một lần
npx supabase login
npx supabase link --project-ref <your-project-ref>

# Sinh types (ghi đè bản viết tay). Chỉ file database.types.ts bị thay;
# domain.ts giữ nguyên vì chỉ import từ generated types.
npx supabase gen types typescript --linked > src/types/database.types.ts
```

Sau khi replace: `domain.ts` compile lại; nếu tên enum/bảng lệch so với migration thì `satisfies readonly Enums<...>[]` sẽ fail build ngay — đó là lưới an toàn để phát hiện drift giữa schema và app.

Ghi chú thêm: `is_admin()` được khai báo trong `public.Functions` (dùng qua `supabase.rpc('is_admin')`); generator thật cũng sẽ liệt kê các function/RPC khác nếu có. `Views`/`CompositeTypes` để rỗng vì schema chưa định nghĩa.

---

Files đề xuất: `D:\FE_Interview\src\types\database.types.ts` và `D:\FE_Interview\src\types\domain.ts`. Đã bao trùm cả 19 bảng (15 bảng chính theo yêu cầu + `tags`, `quiz_set_questions`, `review_logs`, `user_question_progress` để Database type đầy đủ), 10 enums, generic helpers (`Tables`/`TablesInsert`/`TablesUpdate`/`Enums`), Relationships (gồm composite FK `quiz_attempt_answers → quiz_attempts(id,user_id)`), domain unions + scalar narrowing (Difficulty/Frequency/Grade 1..5), và mappers generated→domain.