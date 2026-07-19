-- 0011_tracks.sql
-- Truc "track" (ky thi / linh vuc hoc) tren categories -> tach noi dung cert khoi FE.
-- Chay sau 0000-0010. Dung is_admin() co san.

create table public.tracks (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  kind         text not null check (kind in ('interview','certification')),
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_tracks_updated_at before update on public.tracks
  for each row execute function public.set_updated_at();

insert into public.tracks (slug, name, description, kind, sort_order) values
  ('fe-interview', 'Phong van Front-end',
   'Ngan hang cau hoi phong van FE junior -> senior.', 'interview', 0),
  ('aws-clf', 'AWS Cloud Practitioner',
   'On thi AWS Certified Cloud Practitioner (CLF-C02).', 'certification', 10),
  ('aws-saa', 'AWS Solutions Architect Associate',
   'On thi AWS Certified Solutions Architect - Associate (SAA-C03).', 'certification', 11),
  ('pmp', 'PMP',
   'On thi Project Management Professional (PMBOK / Examination Content Outline).', 'certification', 12)
on conflict (slug) do nothing;

-- categories.track_id: nullable -> backfill -> NOT NULL (trong cung migration).
alter table public.categories add column if not exists track_id uuid references public.tracks(id) on delete restrict;

update public.categories
   set track_id = (select id from public.tracks where slug = 'fe-interview')
 where track_id is null;

alter table public.categories alter column track_id set not null;
create index if not exists idx_categories_track on public.categories (track_id);

alter table public.tracks enable row level security;
create policy "tracks_public_read" on public.tracks
  for select to public using ( is_published = true or (select public.is_admin()) );
create policy "tracks_admin_write" on public.tracks
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

comment on table public.tracks is
  'Truc phan nhom noi dung: interview (FE) hoac certification (AWS/PMP...). categories.track_id tro vao day.';
