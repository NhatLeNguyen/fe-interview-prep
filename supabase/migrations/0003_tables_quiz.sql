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
