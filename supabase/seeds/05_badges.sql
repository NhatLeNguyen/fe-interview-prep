-- 05_badges.sql
-- PHASE 2 (P2.3) — seed dinh nghia badge. Chay SAU migrations/0008_gamification.sql.
-- Idempotent: upsert theo slug.

insert into public.badges (slug, name, description, icon, criteria_type, threshold, sort_order) values
  ('streak-3',   'Khởi động',      'Học 3 ngày liên tiếp.',            'flame',      'streak',        3,  10),
  ('streak-7',   'Bền bỉ',         'Học 7 ngày liên tiếp.',            'flame',      'streak',        7,  11),
  ('streak-30',  'Kỷ luật thép',   'Học 30 ngày liên tiếp.',           'flame',      'streak',       30,  12),
  ('study-10',   'Ham học',        'Hoàn thành 10 lượt học.',          'book-open',  'study',        10,  20),
  ('study-50',   'Chăm chỉ',       'Hoàn thành 50 lượt học.',          'book-open',  'study',        50,  21),
  ('quiz-5',     'Thử sức',        'Hoàn thành 5 bài quiz.',           'list-checks','quiz',          5,  30),
  ('quiz-20',    'Cao thủ quiz',   'Hoàn thành 20 bài quiz.',          'list-checks','quiz',         20,  31),
  ('coding-1',   'Dòng code đầu',  'Giải đúng 1 bài luyện code.',      'code',       'coding_solved', 1,  40),
  ('coding-5',   'Thợ code',       'Giải đúng 5 bài luyện code.',      'code',       'coding_solved', 5,  41),
  ('xp-100',     'Tân binh',       'Đạt 100 XP.',                      'star',       'xp',          100,  50),
  ('xp-500',     'Kỳ cựu',         'Đạt 500 XP.',                      'star',       'xp',          500,  51)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  criteria_type = excluded.criteria_type,
  threshold = excluded.threshold,
  sort_order = excluded.sort_order;
