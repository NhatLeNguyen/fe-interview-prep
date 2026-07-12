# supabase/

Cấu trúc & **thứ tự chạy** (tên file đã đánh số theo thứ tự).

```
supabase/
├── migrations/            # SCHEMA: tạo bảng, cột, type, RLS, trigger
│   ├── 0000_extensions.sql        # pgcrypto
│   ├── 0001_types.sql             # ENUMs + set_updated_at()
│   ├── 0002_tables_content.sql    # profiles, categories, topics, tags, questions, question_tags
│   ├── 0003_tables_quiz.sql       # quiz_sets, quiz_attempts, ...
│   ├── 0004_tables_learning.sql   # flashcard_states, learning_paths, progress, bookmarks, ...
│   ├── 0005_functions_triggers.sql# is_admin(), handle_new_user(), search triggers
│   └── 0006_rls_policies.sql      # bật RLS + policies
├── seeds/                 # DỮ LIỆU seed
│   ├── 01_content.sql             # categories/topics/questions mẫu (chạy sau migrations)
│   └── 02_admin.sql               # cấp quyền admin (chạy SAU khi đã đăng nhập lần đầu)
└── run-all-migrations.sql # tiện: gộp toàn bộ migrations để dán 1 lần vào SQL Editor
```

## Thứ tự chạy (SQL Editor)

1. **Migrations** — dán `run-all-migrations.sql` (hoặc từng file `0000` → `0006`) → Run.
2. **Seed nội dung** — `seeds/01_content.sql` → Run.
3. Đăng ký + đăng nhập tài khoản admin (qua app) → rồi `seeds/02_admin.sql` → Run.

> Nguồn chân lý schema: [`docs/08-RECONCILED-SCHEMA.md`](../docs/08-RECONCILED-SCHEMA.md).
> Khi có Supabase CLI: `npx supabase db push` để chạy migrations tự động.
