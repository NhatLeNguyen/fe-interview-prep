-- 0008_gamification.sql
-- PHASE 2 (P2.3) — Gamification: XP, badge, milestone, leaderboard AN DANH.
-- Chay sau 0000-0007. Dung is_admin() co san.
-- XP duoc TINH TU public.user_activity (khong denormalize -> khong lech du lieu).

-- 1) badges: dinh nghia (cong khai)
create table public.badges (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text not null,
  icon          text not null default 'award',           -- ten icon lucide
  criteria_type text not null check (criteria_type in
                  ('streak','study','quiz','coding_solved','xp')),
  threshold     int  not null check (threshold > 0),
  sort_order    int  not null default 0
);
create index idx_badges_sort on public.badges (sort_order);

-- 2) user_badges: da dat (owner)
create table public.user_badges (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  badge_id  uuid not null references public.badges(id)   on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
create index idx_user_badges_user on public.user_badges (user_id);

-- RLS
alter table public.badges      enable row level security;
alter table public.user_badges enable row level security;

create policy "badges_public_read" on public.badges
  for select to public using ( true );
create policy "badges_admin_write" on public.badges
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "user_badges_owner_all" on public.user_badges
  for all to authenticated
  using ( user_id = (select auth.uid()) ) with check ( user_id = (select auth.uid()) );
create policy "user_badges_admin_read" on public.user_badges
  for select to authenticated using ((select public.is_admin()));

-- 3) Quy tac XP (dung chung cho moi RPC ben duoi)
--    quiz=10, study=5, path=5, review=2
create or replace function public.activity_xp(p_type public.activity_type)
returns int language sql immutable as $$
  select case p_type
    when 'quiz'   then 10
    when 'study'  then 5
    when 'path'   then 5
    when 'review' then 2
    else 1 end;
$$;

-- XP cua CHINH MINH (khong nhan tham so -> khong doc duoc cua nguoi khac)
create or replace function public.my_xp()
returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(public.activity_xp(activity_type)), 0)::int
  from public.user_activity where user_id = auth.uid();
$$;

-- Bang xep hang AN DANH: CHI tra rank + xp, KHONG tra user_id/ten/email.
create or replace function public.leaderboard_anon(p_limit int default 10)
returns table (rank int, xp int)
language sql stable security definer set search_path = public as $$
  with totals as (
    select user_id, sum(public.activity_xp(activity_type))::int as xp
    from public.user_activity group by user_id
  )
  select (row_number() over (order by xp desc, user_id))::int, xp
  from totals
  order by xp desc, user_id
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

-- Hang cua CHINH MINH
create or replace function public.my_rank()
returns int
language sql stable security definer set search_path = public as $$
  with totals as (
    select user_id, sum(public.activity_xp(activity_type))::int as xp
    from public.user_activity group by user_id
  ), ranked as (
    select user_id, (row_number() over (order by xp desc, user_id))::int as rank from totals
  )
  select rank from ranked where user_id = auth.uid();
$$;

-- Chi cho user da dang nhap goi (security definer -> siet quyen)
revoke execute on function public.my_xp()             from public, anon;
revoke execute on function public.leaderboard_anon(int) from public, anon;
revoke execute on function public.my_rank()           from public, anon;
grant  execute on function public.my_xp()             to authenticated;
grant  execute on function public.leaderboard_anon(int) to authenticated;
grant  execute on function public.my_rank()           to authenticated;

comment on function public.leaderboard_anon(int) is
  'Bang xep hang AN DANH: chi tra (rank, xp). Khong bao gio lo danh tinh user.';
