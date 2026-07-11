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
