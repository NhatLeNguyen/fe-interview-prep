-- 0007_coding.sql
-- PHASE 2 (P2.1) — Coding Challenge. Mo rong schema Phase 1, khong pha vo.
-- Spec: docs/superpowers/specs/2026-07-14-coding-challenge-design.md
-- Chay sau 0000-0006. Dung cac function co san: set_updated_at(), is_admin().

-- 1) coding_problems: 1:1 voi 1 question (type='coding'). Khong luu solution (RLS row-level -> lo cot).
create table public.coding_problems (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null unique references public.questions(id) on delete cascade,
  function_name text not null,
  starter_code  text not null default '',
  language      text not null default 'javascript'
                check (language in ('javascript')),
  time_limit_ms int  not null default 3000 check (time_limit_ms between 500 and 10000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_coding_problems_updated_at before update on public.coding_problems
  for each row execute function public.set_updated_at();

-- 2) coding_test_cases: args LUON la JSON array; expected la gia tri tra ve ky vong.
--    is_sample=true -> hien cho user; false -> an (chi cham server-side qua service_role).
create table public.coding_test_cases (
  id          uuid primary key default gen_random_uuid(),
  problem_id  uuid not null references public.coding_problems(id) on delete cascade,
  args        jsonb not null,
  expected    jsonb,
  is_sample   boolean not null default false,
  sort_order  int not null default 0
);
create index idx_coding_test_cases_problem on public.coding_test_cases (problem_id, sort_order);

-- 3) coding_submissions: lich su nop cua user.
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

-- RLS
alter table public.coding_problems    enable row level security;
alter table public.coding_test_cases  enable row level security;
alter table public.coding_submissions enable row level security;

-- coding_problems: public read khi question cha da publish & chua xoa (hoac admin)
create policy "coding_problems_public_read" on public.coding_problems
  for select to public using (
    exists (select 1 from public.questions q
            where q.id = question_id and q.is_published and q.deleted_at is null)
    or (select public.is_admin())
  );
create policy "coding_problems_admin_write" on public.coding_problems
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- coding_test_cases: CHI ca mau (is_sample=true) lo ra ngoai; ca an chi admin/service_role
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

-- coding_submissions: owner doc/ghi cua minh; admin doc tong hop
create policy "coding_submissions_owner_all" on public.coding_submissions
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "coding_submissions_admin_read" on public.coding_submissions
  for select to authenticated using ((select public.is_admin()));
