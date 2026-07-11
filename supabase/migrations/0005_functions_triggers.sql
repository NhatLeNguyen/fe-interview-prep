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
