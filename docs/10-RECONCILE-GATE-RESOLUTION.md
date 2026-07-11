> Tài liệu này thuộc bộ kế hoạch **FE Interview Prep**. Xem tổng quan tại [00-MASTER-PLAN.md](./00-MASTER-PLAN.md).

# RECONCILE GATE — RESOLUTION

> **Dự án:** FE Interview Prep · **Vai trò:** Technical Program Manager · **Ngày chốt:** 2026-07-11
> **Mục đích:** Nhật ký chốt (decision log) đóng dứt điểm mọi mâu thuẫn phát hiện ở bước review (`docs/07`). Sau gate này: **không mở lại** các quyết định đã RESOLVED; mọi build phải bám 2 nguồn chân lý — `docs/08-RECONCILED-SCHEMA.md` (schema + types) và `docs/09-RECONCILED-ARCHITECTURE.md` (cây thư mục). Giải thích tiếng Việt (giữ term EN); SQL/TypeScript bằng English.
> **Kết quả:** 3 blocker (R1/R2/R3) + R4 (kiến trúc) + R5/R6/R7 đã đóng. **17/17 issue reviewer** đã xử lý (RESOLVED hoặc DEFERRED có chủ đích).

---

## 1. Bảng chốt R1..R7

| Mã | Vấn đề gốc (từ `docs/07`) | Quyết định chốt | Trạng thái |
|---|---|---|---|
| **R1** | Schema chưa chạy được 2 MVP must-have: (a) `quiz_attempts.quiz_id` NOT NULL → không tạo được **custom quiz**; (b) **thiếu hoàn toàn** bảng tiến độ learning-path (không unlock/resume được). | (a) Gộp preset + custom vào **`quiz_attempts`**, `quiz_set_id` **NULLABLE** + cột `config jsonb` (lưu filter đã chọn) + snapshot `question_ids`. (b) Thêm **BẢNG MỚI `learning_path_progress`** (per user × per item: status/completed_at/score) → sequential unlock + resume tính được. | **RESOLVED** |
| **R2** | Không có single source of truth: 3 section mô tả 3 mô hình quiz/flashcard/learning-path, tên bảng lệch (`flashcards` vs `flashcard_reviews`, `path_steps` vs `learning_path_items`, `quiz_sessions` vs `quiz_attempts`, `user_progress` vs `user_topic_progress`, `bookmarks` vs `user_bookmarks`). | Chốt **MỘT bộ tên canonical duy nhất** (xem §2.1). Flashcard = **`flashcard_states`** (+ `review_logs`); lượt làm bài = **`quiz_attempts`** (gộp preset & custom); item lộ trình = **`learning_path_items`** (flat). **Không còn bất kỳ tên lệch nào.** | **RESOLVED** |
| **R3** | Enum phân loại xung đột taxonomy (`docs/01`): `type` trong DB là ANSWER FORMAT (single/multiple/true_false/open_ended) ≠ KIND của taxonomy; `difficulty_level` gộp seniority vào difficulty; **thiếu hẳn `frequency`**. | Tách 3 trục: **`question_type` (KIND)** = `theory\|coding\|quiz\|system-design\|behavioral`; **`answer_format`** (chỉ dùng khi `type='quiz'`) = `single_choice\|multiple_choice\|true_false\|open_ended`; **`level`** = `junior\|mid\|senior` **TÁCH KHỎI** **`difficulty`** = smallint 1–5 (CHECK); **THÊM `frequency`** = smallint 1–5 (CHECK) → build được "must-know deck" (`frequency>=4`). | **RESOLVED** |
| **R4** | Kiến trúc thư mục mâu thuẫn nền tảng: `docs/03` feature-based (`src/features/*` + `services/`) vs `docs/05` layer-based (`components/domain`, `lib/helpers`, không `src/`, không `features/`). | Chốt **`feature-first + shared layer`, gốc tại `src/`**. Data-access = **`api/*.api.ts` trong mỗi feature**. `lib/` = **chỉ infra**. Design tokens/component inventory/a11y của `docs/05` vẫn giữ; chỉ **cấu trúc thư mục** của nó bị thay. Chi tiết: `docs/09`. | **RESOLVED** |
| **R5** | Thiếu trường cho SRS state (không có `state` new/learning/review/relearning; new card flood queue) + thiếu nguồn streak/activity heatmap (không có `last_active_date/current_streak/longest_streak`, không bảng activity). | **`flashcard_states`** đủ trường SRS: `state` (enum 4 giá trị), `ease_factor`, `interval_days`, `due_date`, `reps`, `lapses`, `last_reviewed_at`; log bất biến **`review_logs`**; cap "new cards/ngày". Streak: cột trên **`profiles`** (`last_active_date/current_streak/longest_streak`) + bảng **`user_activity`** (heatmap). | **RESOLVED** |
| **R6** | RLS: chỉ `flashcard_reviews` có `admin_read`; các bảng cá nhân khác (`quiz_attempts`, `bookmarks`, `user_topic_progress`…) chỉ `owner_all` → **admin dashboard/analytics không đọc được** dữ liệu tổng hợp. | Thêm helper **`is_admin()`** (SECURITY DEFINER đọc `profiles.role`) + policy **`admin_read` (SELECT USING is_admin())`** trên **mọi** bảng cá nhân (`quiz_attempts`, `quiz_attempt_answers`, `bookmarks`, `user_topic_progress`, `user_question_progress`, `flashcard_states`, `review_logs`, `learning_path_progress`, `user_activity`) + column-level GRANT/REVOKE. | **RESOLVED** |
| **R7** | `questions.slug` NULLABLE nhưng route `/questions/[questionSlug]` + cần UNIQUE → câu không slug thì 404, id vs slug không nhất quán. | **`questions.slug NOT NULL + UNIQUE`**, kebab-case, immutable sau publish (xem quy ước §2.4). Áp cùng chuẩn cho `categories.slug`, `topics.slug`, `learning_paths.slug`. | **RESOLVED** |

**Ghi chú trạng thái:** Toàn bộ R1–R7 **RESOLVED** ở tầng schema/kiến trúc. Phần *vận hành phụ trợ* của R5 (nhắc "đến hạn ôn" qua email/push) được **DEFERRED → Phase 2** — dữ liệu SRS đã đủ, chỉ hoãn cơ chế notification (xem §3).

---

## 2. Các quyết định chốt quan trọng

### 2.1. Tên bảng cuối cùng — NGUỒN CHÂN LÝ DUY NHẤT (R2)

Mọi FK / policy / trigger tham chiếu **đúng** bộ tên này. Không tên lệch nào còn tồn tại.

| Vai trò | ✅ Tên canonical |
|---|---|
| Profile mở rộng `auth.users` (+ streak fields) | **`profiles`** |
| Nhóm lớn (+ `deleted_at`) | **`categories`** |
| Chủ đề con (+ `deleted_at`) | **`topics`** |
| Nhãn phẳng | **`tags`** |
| Join câu ↔ tag | **`question_tags`** |
| Ngân hàng câu hỏi (gộp content) | **`questions`** |
| Bộ đề **preset** (curated) | **`quiz_sets`** |
| Join bộ đề ↔ câu | **`quiz_set_questions`** |
| Lượt làm bài (preset **và** custom) | **`quiz_attempts`** |
| Đáp án từng câu trong lượt | **`quiz_attempt_answers`** |
| Trạng thái SRS mỗi (user, câu) | **`flashcard_states`** |
| Log SRS bất biến | **`review_logs`** |
| Lộ trình (+ `deleted_at`) | **`learning_paths`** |
| Item lộ trình (flat + `module_title`/`step_key`) | **`learning_path_items`** |
| Tiến độ lộ trình per-item **(BẢNG MỚI — R1)** | **`learning_path_progress`** |
| Tiến độ theo topic (aggregate) | **`user_topic_progress`** |
| Tiến độ từng câu **(BẢNG MỚI)** | **`user_question_progress`** |
| Bookmark | **`bookmarks`** |
| Streak / activity / heatmap | **`user_activity`** |

*Enum chốt:* `question_type`, `answer_format`, `level`, `srs_state (new\|learning\|review\|relearning)`; `difficulty`/`frequency` = smallint 1–5 + CHECK. Chi tiết cột & type xem `docs/08`.

### 2.2. Xử lý song ngữ — content là MỘT field (không cột dịch song song)

> **Nội dung = MỘT đoạn văn tiếng Việt GIỮ NGUYÊN thuật ngữ EN** (`closure`, `hoisting`, `reconciliation`…). **KHÔNG** tách 2 bản dịch VI/EN. i18n **chỉ** áp cho UI strings (label/nút), xử lý ở **frontend**, **không lưu DB**.

| `docs/04` (bỏ) | ✅ Chốt (1 field) |
|---|---|
| `name_vi` + `name_en` | **`name`** |
| `description_vi` + `description_en` | **`description`** |
| `question_vi` + `question_en` | **`prompt_md`** |
| `answer_vi` + `answer_en` | **`answer_md`** |
| `title_vi` + `title_en` | **`title`** |
| `options {key, text_vi, text_en}` | **`options jsonb: {key, text, explanation?}`** |

*Hệ quả:* FTS (`tsvector`) index trực tiếp trên `prompt_md + answer_md + title + tags` (1 ngôn ngữ) — đơn giản hơn, khớp AC search.

### 2.3. Mô hình thư mục đã chốt (R4)

`feature-first + shared layer`, gốc `src/`:

- **`src/features/<domain>/`** — mỗi domain (`questions`, `quiz`, `flashcard`, `learning-path`, `progress`, `auth`, `admin`) tự đóng gói: `components/`, `hooks/`, `api/*.api.ts`, `helpers/`, `constants.ts`, `types.ts`. Thêm domain mới = thêm 1 folder, **không đụng** shared/feature cũ (open-closed).
- **Shared layer:** `src/components` (UI dùng chung + shadcn), `src/hooks`, `src/helpers` (pure — cấm `import react`, enforce bằng ESLint `no-restricted-imports`), `src/constants`, `src/types`.
- **`src/lib/` = CHỈ infra:** `lib/supabase/` (client + `database.types.ts` generated), env, third-party wiring.
- **SM-2 shared:** **`src/helpers/spaced-repetition.ts`** (kebab-case, dùng bởi `flashcard` **và** `progress`/dashboard). **Chốt biến thể thuật toán:** early-return giữ nguyên `ease_factor` khi `grade<3` (không decay ease mỗi lần "Again") — theo helper `docs/03`, **bác** pseudocode `docs/02` tính ease vô điều kiện.
- **Route chốt:** `/questions/[questionSlug]`, `/quiz` + `/quiz/[quizSetSlug]` + custom builder, `/quiz/attempt/[attemptId]/result`, `/flashcards` (gồm due queue), `/learning-path/[pathSlug]`, `/dashboard`, `/admin/*`.

### 2.4. Quy ước slug (R7)

- `questions.slug`, `categories.slug`, `topics.slug`, `learning_paths.slug`: **NOT NULL + UNIQUE**, **kebab-case** (`event-loop-microtask-order`).
- Sinh từ title/key ổn định lúc tạo; **immutable sau khi publish** (đổi title không đổi slug) để tránh 404/link chết.
- Route dùng slug làm định danh public; `id (uuid)` chỉ dùng nội bộ/FK.

### 2.5. Custom quiz & Learning-path progress hoạt động thế nào (R1)

**Custom quiz (ad-hoc):**
1. User chọn filter (topics/level/difficulty/frequency) → app query ra tập câu, snapshot `question_ids`.
2. Tạo `quiz_attempts` với **`quiz_set_id = NULL`** + `config jsonb` (lưu filter + `question_ids` đã chọn) → reproducible/resume/chấm điểm server-side.
3. Từng câu lưu vào `quiz_attempt_answers`. Preset quiz đi cùng đường, khác mỗi `quiz_set_id` trỏ `quiz_sets` (config có thể NULL).

**Learning-path progress:**
1. `learning_path_items` (flat, có `order`, `module_title`, `step_key`) định nghĩa nội dung + thứ tự.
2. `learning_path_progress` (per user × per item) lưu `status` (`locked|available|in_progress|completed`), `completed_at`, `score`.
3. **Sequential unlock:** item kế mở khi item trước `completed` (tính theo `order`). **Resume:** đọc item `in_progress`/available đầu tiên. Tổng % lộ trình = completed items / total.

---

## 3. Chưa làm / DEFER sang phase sau

| Hạng mục | Phase | Lý do ngắn |
|---|---|---|
| SRS reminder/notification (email/push/cron "thẻ đến hạn") | **Phase 2** | Dữ liệu SRS đã đủ; MVP hiển thị due queue **in-app**. Chưa dựng infra scheduled job/notification. |
| Offline queue cho review (IndexedDB/Service Worker + bảng sync) | **Phase 3 (PWA)** | Cần tầng SW/PWA chưa có ở MVP; MVP yêu cầu online. |
| Content versioning / lịch sử `QuestionContent` | **Phase 2** | MVP chỉ giữ cờ boolean **`is_deprecated`**; full version history hoãn. |
| `user_badges` / gamification | **Phase 2** | Ngoài core MVP; streak đã đủ tạo giá trị. |
| `relatedQuestionIds` (bảng quan hệ tường minh) | **Phase 2** | MVP compute "câu liên quan" theo topic/tag. |
| Company filter UI (`companies`, `source` columns) | **Phase 2** | Giữ cột nullable trong schema, hoãn UI filter. |
| a11y testing (jest-axe), visual regression, Storybook | **Phase 2/3** | Testing nâng cao; MVP tập trung unit + e2e critical path. |

---

## 4. Bước tiếp theo (post-gate)

1. **Tạo Supabase project** (dev + prod) → chạy migration đúng thứ tự `0000_extensions → 0001_types → 0002_tables_content → 0003_tables_quiz → 0004_tables_learning → 0005_functions_triggers → 0006_rls_policies` (lưu ý: `set_updated_at()` ở **0001**; `question_tags` `CREATE` ngay sau `questions`).
2. **`supabase gen types typescript`** từ **DB thật** → ghi `src/lib/supabase/database.types.ts` (không viết tay types) → alias tiện dụng `src/types/db.ts`.
3. **Cài Supabase CLI đúng cách** (Scoop `supabase/tap` hoặc binary release — **KHÔNG** `npm install -g supabase`; sửa lệnh `psql`/`-Scope` như review point DevOps).
4. **Vào Phase 1 build** theo `docs/09`: scaffold `src/`, wiring `lib/supabase`, seed nội dung mẫu (đảm bảo `slug` + `frequency`/`level`/`difficulty` đầy đủ), dựng vertical slice `questions` → `quiz` → `flashcard` → `learning-path` → `dashboard` → `admin`.

**Gate status: PASSED — build-ready.** Tất cả blocker đã đóng; nguồn chân lý = `docs/08` (schema/types) + `docs/09` (kiến trúc).