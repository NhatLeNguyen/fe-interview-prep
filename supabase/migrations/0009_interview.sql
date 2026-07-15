-- 0009_interview.sql
-- PHASE 2 (P2.2) — Mock Interview: phien phong van mo phong + cau tra loi tu danh gia.
-- Chay sau 0000-0008. Tai dung enum public.level, public.attempt_status.

create table public.interview_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  level           public.level not null default 'junior',
  category_slug   text,                                   -- null = moi chu de
  total_questions int  not null check (total_questions between 1 and 20),
  status          public.attempt_status not null default 'in_progress',
  self_score      numeric(5,2),                           -- % trung binh tu cham (0-100)
  started_at      timestamptz not null default now(),
  finished_at     timestamptz
);
create index idx_interview_sessions_user on public.interview_sessions (user_id, started_at desc);

create table public.interview_answers (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.interview_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  order_index int  not null,
  answer_text text,
  self_rating smallint check (self_rating between 1 and 5),
  answered_at timestamptz,
  unique (session_id, question_id)
);
create index idx_interview_answers_session on public.interview_answers (session_id, order_index);

-- RLS
alter table public.interview_sessions enable row level security;
alter table public.interview_answers  enable row level security;

create policy "interview_sessions_owner_all" on public.interview_sessions
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "interview_sessions_admin_read" on public.interview_sessions
  for select to authenticated using ( (select public.is_admin()) );

-- Answers gate theo quyen so huu cua session cha
create policy "interview_answers_owner_all" on public.interview_answers
  for all to authenticated
  using ( exists (select 1 from public.interview_sessions s
                  where s.id = session_id and s.user_id = (select auth.uid())) )
  with check ( exists (select 1 from public.interview_sessions s
                       where s.id = session_id and s.user_id = (select auth.uid())) );
create policy "interview_answers_admin_read" on public.interview_answers
  for select to authenticated using ( (select public.is_admin()) );

comment on table public.interview_sessions is
  'P2.2 Mock Interview: 1 phien = N cau hoi ly thuyet/system-design/behavioral, user tu tra loi va tu cham 1-5.';
