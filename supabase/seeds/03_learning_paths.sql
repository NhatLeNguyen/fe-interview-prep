-- 03_learning_paths.sql
-- Seed 3 lộ trình học (junior -> mid -> senior). Item tham chiếu topic theo slug.
-- Idempotent: upsert path theo slug, xoá item cũ của path rồi insert lại.
-- LƯU Ý: xoá item sẽ cascade learning_path_progress của user cho path đó (chạy lúc setup là an toàn).
-- Chạy sau seeds/01_content.sql (cần có bảng topics).

do $$
declare v_path_id uuid;
begin
  insert into public.learning_paths (slug, title, description, target_level, sort_order, is_published)
  values ('junior-frontend-foundation', 'Nền tảng Frontend (Junior)', 'Xây nền vững cho người mới: HTML/CSS căn bản, JavaScript cốt lõi, React nhập môn và Next.js khởi đầu.', 'junior', 1, true)
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    target_level = excluded.target_level,
    sort_order = excluded.sort_order,
    is_published = true
  returning id into v_path_id;

  delete from public.learning_path_items where path_id = v_path_id;

  insert into public.learning_path_items
    (path_id, item_type, topic_id, module_title, step_key, sort_order, is_optional)
  select v_path_id, 'topic', t.id, v.module_title::text, v.step_key::text, v.sort_order::int, v.is_optional::boolean
  from (values
    ('html-semantic', 'HTML & CSS căn bản', 'm1', 0, false),
    ('css-box-model', 'HTML & CSS căn bản', 'm1', 1, false),
    ('css-flexbox-layout', 'HTML & CSS căn bản', 'm1', 2, false),
    ('js-types-coercion', 'JavaScript nền tảng', 'm2', 3, false),
    ('browser-events', 'JavaScript nền tảng', 'm2', 4, false),
    ('browser-storage', 'JavaScript nền tảng', 'm2', 5, false),
    ('react-jsx-rendering', 'React nhập môn', 'm3', 6, false),
    ('nextjs-app-router', 'Next.js khởi đầu', 'm4', 7, false)
  ) as v(topic_slug, module_title, step_key, sort_order, is_optional)
  join public.topics t on t.slug = v.topic_slug;
end $$;

do $$
declare v_path_id uuid;
begin
  insert into public.learning_paths (slug, title, description, target_level, sort_order, is_published)
  values ('mid-frontend-engineer', 'Kỹ sư Frontend (Mid-level)', 'Nâng cấp lên mid: JavaScript chuyên sâu, TypeScript, React thực chiến, RSC của Next.js, CSS nâng cao và hiệu năng web.', 'mid', 2, true)
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    target_level = excluded.target_level,
    sort_order = excluded.sort_order,
    is_published = true
  returning id into v_path_id;

  delete from public.learning_path_items where path_id = v_path_id;

  insert into public.learning_path_items
    (path_id, item_type, topic_id, module_title, step_key, sort_order, is_optional)
  select v_path_id, 'topic', t.id, v.module_title::text, v.step_key::text, v.sort_order::int, v.is_optional::boolean
  from (values
    ('js-scope-closure', 'JavaScript chuyên sâu', 'm1', 0, false),
    ('js-event-loop', 'JavaScript chuyên sâu', 'm1', 1, false),
    ('js-this-prototype', 'JavaScript chuyên sâu', 'm1', 2, false),
    ('ts-generics', 'TypeScript', 'm2', 3, false),
    ('ts-utility-types', 'TypeScript', 'm2', 4, false),
    ('ts-narrowing-guards', 'TypeScript', 'm2', 5, false),
    ('react-hooks-core', 'React thực chiến', 'm3', 6, false),
    ('react-forms-state', 'React thực chiến', 'm3', 7, false),
    ('nextjs-rsc', 'Next.js & RSC', 'm4', 8, false),
    ('nextjs-optimization', 'Next.js & RSC', 'm4', 9, false),
    ('css-grid-responsive', 'CSS nâng cao', 'm5', 10, false),
    ('css-positioning-stacking', 'CSS nâng cao', 'm5', 11, false),
    ('perf-core-web-vitals', 'Hiệu năng web', 'm6', 12, false),
    ('perf-lazy-code-splitting', 'Hiệu năng web', 'm6', 13, true)
  ) as v(topic_slug, module_title, step_key, sort_order, is_optional)
  join public.topics t on t.slug = v.topic_slug;
end $$;

do $$
declare v_path_id uuid;
begin
  insert into public.learning_paths (slug, title, description, target_level, sort_order, is_published)
  values ('senior-frontend-architect', 'Kiến trúc sư Frontend (Senior)', 'Trình độ senior: bất đồng bộ & pattern nâng cao, kiến trúc render React, rendering/caching của Next.js, accessibility và tối ưu hiệu năng chuyên sâu.', 'senior', 3, true)
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    target_level = excluded.target_level,
    sort_order = excluded.sort_order,
    is_published = true
  returning id into v_path_id;

  delete from public.learning_path_items where path_id = v_path_id;

  insert into public.learning_path_items
    (path_id, item_type, topic_id, module_title, step_key, sort_order, is_optional)
  select v_path_id, 'topic', t.id, v.module_title::text, v.step_key::text, v.sort_order::int, v.is_optional::boolean
  from (values
    ('js-async-eventloop', 'JavaScript senior', 'm1', 0, false),
    ('js-patterns-memory', 'JavaScript senior', 'm1', 1, false),
    ('ts-advanced-operators', 'TypeScript nâng cao', 'm2', 2, false),
    ('react-render', 'React kiến trúc', 'm3', 3, false),
    ('react-performance', 'React kiến trúc', 'm3', 4, false),
    ('react-patterns', 'React kiến trúc', 'm3', 5, false),
    ('nextjs-rendering', 'Next.js rendering & caching', 'm4', 6, false),
    ('nextjs-data-caching', 'Next.js rendering & caching', 'm4', 7, false),
    ('css-specificity-cascade', 'CSS & Accessibility', 'm5', 8, false),
    ('html-a11y', 'CSS & Accessibility', 'm5', 9, false),
    ('perf-bundle-optimization', 'Tối ưu hiệu năng', 'm6', 10, false),
    ('perf-render-optimization', 'Tối ưu hiệu năng', 'm6', 11, false),
    ('perf-caching-assets', 'Tối ưu hiệu năng', 'm6', 12, true)
  ) as v(topic_slug, module_title, step_key, sort_order, is_optional)
  join public.topics t on t.slug = v.topic_slug;
end $$;

