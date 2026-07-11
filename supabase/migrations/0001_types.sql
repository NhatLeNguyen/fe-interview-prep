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
