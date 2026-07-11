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
