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
