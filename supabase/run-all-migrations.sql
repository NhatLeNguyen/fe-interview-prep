-- ==============================================================
-- RUN-ALL MIGRATIONS — FE Interview Prep
-- Cach dung: mo Supabase Dashboard > SQL Editor > New query,
-- dan TOAN BO file nay vao, bam RUN. (Cac lenh chay dung thu tu 0000 -> 0006.)
-- File nay sinh tu 7 file trong supabase/migrations/ — khong sua tay.
-- ==============================================================

-- ##############################################################
-- ## supabase/migrations/0000_extensions.sql
-- ##############################################################
-- 0000_extensions.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

-- 0000_extensions.sql
create extension if not exists pgcrypto;   -- gen_random_uuid()


-- ##############################################################
-- ## supabase/migrations/0001_types.sql
-- ##############################################################
-- 0001_types.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

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


-- ##############################################################
-- ## supabase/migrations/0002_tables_content.sql
-- ##############################################################
-- 0002_tables_content.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

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

create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

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

create table public.question_tags (
  question_id uuid not null references public.questions(id) on delete cascade,
  tag_id      uuid not null references public.tags(id)      on delete cascade,
  primary key (question_id, tag_id)
);
create index idx_question_tags_tag on public.question_tags (tag_id);


-- ##############################################################
-- ## supabase/migrations/0003_tables_quiz.sql
-- ##############################################################
-- 0003_tables_quiz.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

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


-- ##############################################################
-- ## supabase/migrations/0004_tables_learning.sql
-- ##############################################################
-- 0004_tables_learning.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

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


-- ##############################################################
-- ## supabase/migrations/0005_functions_triggers.sql
-- ##############################################################
-- 0005_functions_triggers.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

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


-- ##############################################################
-- ## supabase/migrations/0006_rls_policies.sql
-- ##############################################################
-- 0006_rls_policies.sql
-- Sinh tu docs/08-RECONCILED-SCHEMA.md (nguon chan ly). KHONG sua tay o day; sua o docs/08 roi tao lai.
-- Chay theo dung thu tu 0000 -> 0006.

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


